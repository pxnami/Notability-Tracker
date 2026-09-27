// @vitest-environment node
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

const code = ts.transpile(readFileSync(new URL("./index.ts", import.meta.url), "utf8"), { target: ts.ScriptTarget.ES2022 });
const article = { id: 1, title: "Support article", body: "<p>Original</p>", html_url: "https://support.gingerlabs.com/hc/en-us/articles/1", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-02T00:00:00Z", draft: false };

function setup(options: { existing?: boolean; failApi?: boolean; failDb?: boolean; badNext?: boolean } = {}) {
  let handler!: (request: Request) => Promise<Response>;
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.startsWith("https://support.gingerlabs.com")) {
      if (options.failApi) return new Response("Unavailable", { status: 503 });
      return Response.json({ articles: [article], next_page: options.badNext ? "https://example.com/steal" : null });
    }
    if (url.endsWith("/sync_jobs") && init?.method === "POST") return Response.json([{ id: "job-1" }]);
    if (url.includes("source_records?") && init?.method === "GET") {
      return Response.json(options.existing ? [{ stable_source_id: "1", raw: { updated_at: article.updated_at } }] : []);
    }
    if (options.failDb && url.includes("source_records?") && init?.method === "POST") return new Response("denied", { status: 403 });
    return new Response(null, { status: 204 });
  });
  runInNewContext(code, {
    Deno: { env: { get: (name: string) => ({ SUPABASE_URL: "https://test.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "server-key", SUPABASE_SECRET_KEYS: '{"default":"sb_secret_test_only"}' })[name] }, serve: (fn: typeof handler) => { handler = fn; } },
    Request, Response, URL, AbortSignal, fetch: fetchMock, console
  });
  return { fetchMock, call: (body = '{"source":"support"}', key = "server-key", apiKey?: string) => handler(new Request("https://test/sync", { method: "POST", headers: { authorization: `Bearer ${key}`, ...(apiKey ? { apikey: apiKey } : {}) }, body })) };
}

describe("support sync", () => {
  it("accepts the configured secret API key and uses it only as an API key downstream", async () => {
    const { call, fetchMock } = setup();
    expect((await call('{}', 'not-a-service-token', 'sb_secret_test_only')).status).toBe(200);
    const headers = fetchMock.mock.calls[0][1]?.headers;
    expect(headers).toMatchObject({ apikey: 'sb_secret_test_only' });
    expect(headers).not.toHaveProperty('Authorization');
  });
  it.each(['sb_publishable_public', 'sb_secret_wrong'])("rejects an untrusted API key: %s", async (apiKey) => {
    const { call, fetchMock } = setup();
    expect((await call('{}', 'public-key', apiKey)).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects public callers before any network or database access", async () => {
    const { call, fetchMock } = setup();
    expect((await call('{}', 'public-key')).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects malformed requests and unsupported sources", async () => {
    const { call, fetchMock } = setup();
    expect((await call('null')).status).toBe(400);
    expect((await call('{"source":"reddit"}')).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("imports original records with stable upsert keys", async () => {
    const { call, fetchMock } = setup();
    expect(await (await call()).json()).toMatchObject({ ok: true, seen: 1, changed: 1 });
    const write = fetchMock.mock.calls.find(([url, init]) => url.includes("source_records?") && init?.method === "POST");
    expect(JSON.parse(String(write?.[1]?.body))[0]).toMatchObject({ stable_source_id: "1", body: article.body, source_id: "support" });
  });
  it("does not rewrite unchanged articles", async () => {
    const { call, fetchMock } = setup({ existing: true });
    expect(await (await call()).json()).toMatchObject({ changed: 0, seen: 1 });
    expect(fetchMock.mock.calls.some(([url, init]) => url.includes("source_records?") && init?.method === "POST")).toBe(false);
  });
  it.each([{ failApi: true }, { failDb: true }, { badNext: true }])("reports failed imports instead of success: %j", async (options) => {
    const { call, fetchMock } = setup(options);
    expect((await call()).status).toBe(502);
    expect(fetchMock.mock.calls.some(([url, init]) => url.includes("sync_jobs?id=") && String(init?.body).includes('"status":"failed"'))).toBe(true);
    expect(fetchMock.mock.calls.some(([url]) => url.startsWith("https://example.com"))).toBe(false);
  });
});
