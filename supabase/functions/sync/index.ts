import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const connectors = {
  productboard: syncProductboard,
  reddit: syncReddit,
  github: syncGithub,
  discord: syncDiscord,
  support: syncSupport,
  release_notes: syncReleaseNotes,
  status: syncStatus,
  blog: syncBlog
};

serve(async (request) => {
  const { source = "all" } = await request.json().catch(() => ({ source: "all" }));
  const selected = source === "all" ? Object.keys(connectors) : [source];
  const results = [];

  for (const key of selected) {
    const connector = connectors[key as keyof typeof connectors];
    if (!connector) continue;
    results.push(await runConnector(key, connector));
  }

  return Response.json({ ok: true, results });
});

async function runConnector(sourceId: string, connector: () => Promise<{ seen: number; changed: number; notes: string[] }>) {
  const { data: job } = await supabase.from("sync_jobs").insert({ source_id: sourceId, status: "running" }).select().single();
  try {
    const result = await connector();
    await supabase.from("sync_jobs").update({
      status: "succeeded",
      finished_at: new Date().toISOString(),
      records_seen: result.seen,
      records_changed: result.changed
    }).eq("id", job.id);
    await supabase.from("sources").update({ health: "healthy", last_successful_sync: new Date().toISOString() }).eq("id", sourceId);
    return { sourceId, status: "succeeded", ...result };
  } catch (error) {
    await supabase.from("sync_jobs").update({ status: "failed", finished_at: new Date().toISOString() }).eq("id", job.id);
    await supabase.from("sync_logs").insert({ sync_job_id: job.id, level: "error", message: error instanceof Error ? error.message : "Unknown error" });
    await supabase.from("sources").update({ health: "failed" }).eq("id", sourceId);
    return { sourceId, status: "failed" };
  }
}

async function syncProductboard() {
  return placeholder("Productboard public extraction requires confirmed allowed selectors or API key.");
}

async function syncReddit() {
  if (!Deno.env.get("REDDIT_CLIENT_ID") || !Deno.env.get("REDDIT_CLIENT_SECRET")) {
    return placeholder("Reddit OAuth credentials are not configured.");
  }
  return placeholder("Reddit OAuth connector scaffold is ready for token exchange and listing ingestion.");
}

async function syncGithub() {
  if (!Deno.env.get("GITHUB_TOKEN")) return placeholder("GitHub token is not configured.");
  return placeholder("GitHub organization discovery scaffold is ready.");
}

async function syncDiscord() {
  if (!Deno.env.get("DISCORD_BOT_TOKEN")) return placeholder("Discord bot token is not configured.");
  return placeholder("Discord event ingestion should run from an authorized bot.");
}

async function syncSupport() {
  return placeholder("Support crawler awaits confirmed sitemap/feed endpoints.");
}

async function syncReleaseNotes() {
  return placeholder("Release-note source discovery awaits authoritative URL confirmation.");
}

async function syncStatus() {
  return placeholder("Status page discovery awaits authoritative URL confirmation.");
}

async function syncBlog() {
  return placeholder("Blog RSS/public article crawler scaffold is ready.");
}

function placeholder(note: string) {
  return Promise.resolve({ seen: 0, changed: 0, notes: [note] });
}
