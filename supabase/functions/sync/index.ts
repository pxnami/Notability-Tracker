const supportOrigin = "https://support.gingerlabs.com";
const firstPage = `${supportOrigin}/api/v2/help_center/en-us/articles.json?per_page=100&sort_by=updated_at&sort_order=desc`;

type Article = {
  id: number;
  title: string;
  html_url: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  draft: boolean;
};

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return Response.json({ error: "Use POST" }, { status: 405 });
  const url = Deno.env.get("SUPABASE_URL");
  const legacyKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let secretKeys: string[];
  try {
    const configured = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    if (!configured || typeof configured !== "object" || Array.isArray(configured)) throw new Error("Invalid keys");
    secretKeys = Object.values(configured).filter((value): value is string =>
      typeof value === "string" && value.startsWith("sb_secret_") && value.length > 10
    );
  } catch {
    return Response.json({ error: "Server key configuration invalid" }, { status: 503 });
  }
  const key = secretKeys[0] || legacyKey;
  if (!url || !key) return Response.json({ error: "Server configuration missing" }, { status: 503 });
  // Public API keys and ordinary signed-in users must never trigger privileged imports.
  const suppliedKey = request.headers.get("apikey");
  const secretAuthorized = Boolean(suppliedKey && secretKeys.includes(suppliedKey));
  const legacyAuthorized = Boolean(legacyKey && request.headers.get("authorization") === `Bearer ${legacyKey}`);
  if (!secretAuthorized && !legacyAuthorized) {
    return Response.json({ error: "Valid secret API key or service-role authorization required" }, { status: 401 });
  }
  let source: string;
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid body");
    source = body.source ?? "support";
    if (source !== "support" && source !== "all") {
      return Response.json({ error: "Only the support connector is implemented" }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Expected a JSON object" }, { status: 400 });
  }

  async function database(path: string, method = "GET", body?: unknown, prefer?: string) {
    const response = await fetch(`${url}/rest/v1/${path}`, {
      method,
      headers: {
        apikey: key!, "Content-Type": "application/json",
        ...(key === legacyKey ? { Authorization: `Bearer ${key}` } : {}),
        ...(prefer ? { Prefer: prefer } : {})
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`Database ${method} ${path.split("?")[0]} failed (HTTP ${response.status})`);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  let jobId: string | undefined;
  let seen = 0;
  let changed = 0;
  try {
    await database("sources?on_conflict=id", "POST", {
      id: "support", name: "Notability Support", url: `${supportOrigin}/hc/en-us`, official: true
    }, "resolution=merge-duplicates,return=minimal");
    const jobs = await database("sync_jobs", "POST", { source_id: "support", status: "running" }, "return=representation");
    jobId = jobs[0].id;
    const visited = new Set<string>();
    let next: string | null = firstPage;
    while (next) {
      const pageUrl = new URL(next);
      if (pageUrl.origin !== supportOrigin || !pageUrl.pathname.startsWith("/api/v2/help_center/en-us/articles")) {
        throw new Error("Unexpected support pagination URL");
      }
      if (visited.has(next) || visited.size >= 10) throw new Error("Support pagination limit reached; import incomplete");
      visited.add(next);
      const response = await fetch(next, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`Support API failed (HTTP ${response.status})`);
      const page = await response.json();
      if (!Array.isArray(page.articles)) throw new Error("Invalid support article response");
      const articles: Article[] = page.articles.filter((article: Article) => !article.draft);
      for (const article of articles) {
        if (!Number.isSafeInteger(article.id) || typeof article.title !== "string" ||
            typeof article.updated_at !== "string" || typeof article.created_at !== "string" ||
            typeof article.html_url !== "string" || new URL(article.html_url).origin !== supportOrigin ||
            (article.body !== null && typeof article.body !== "string")) {
          throw new Error("Invalid support article fields");
        }
      }
      seen += articles.length;
      if (articles.length) {
        const ids = articles.map(article => article.id).join(",");
        const existing: { stable_source_id: string; raw: { updated_at?: string } }[] = await database(
          `source_records?source_id=eq.support&stable_source_id=in.(${ids})&select=stable_source_id,raw`
        );
        const versions = new Map(existing.map(record => [record.stable_source_id, record.raw?.updated_at]));
        const updates = articles.filter(article => versions.get(String(article.id)) !== article.updated_at);
        if (updates.length) {
          await database("source_records?on_conflict=source_id,stable_source_id", "POST", updates.map(article => ({
            source_id: "support", stable_source_id: String(article.id), title: article.title,
            body: article.body, url: article.html_url, published_at: article.created_at,
            fetched_at: new Date().toISOString(), raw: { updated_at: article.updated_at, format: "html" }
          })), "resolution=merge-duplicates,return=minimal");
          changed += updates.length;
        }
      }
      if (page.next_page !== null && typeof page.next_page !== "string") throw new Error("Invalid support pagination");
      next = page.next_page;
    }
    await database("sources?id=eq.support", "PATCH", { health: "healthy", last_successful_sync: new Date().toISOString() });
    await database(`sync_jobs?id=eq.${jobId}`, "PATCH", {
      status: "succeeded", finished_at: new Date().toISOString(), records_seen: seen, records_changed: changed
    });
    return Response.json({ ok: true, source: "support", seen, changed,
      ...(source === "all" ? { skipped: ["productboard", "reddit", "github", "discord", "release_notes", "status", "blog"] } : {})
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    try {
      await database("sources?id=eq.support", "PATCH", { health: "failed" });
      if (jobId) {
        await database(`sync_jobs?id=eq.${jobId}`, "PATCH", {
          status: "failed", finished_at: new Date().toISOString(), records_seen: seen, records_changed: changed
        });
        await database("sync_logs", "POST", { sync_job_id: jobId, level: "error", message });
      }
    } catch {
      console.error("Could not persist sync failure status");
    }
    return Response.json({ ok: false, error: message, seen, changed }, { status: 502 });
  }
});
