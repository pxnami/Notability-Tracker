# Deployment

## Frontend

1. Create or reuse a GitHub repository named `notability-tracker`.
2. Push this project to the repository's `main` branch.
3. In GitHub repository settings, set Pages source to GitHub Actions.
4. Run the `Deploy GitHub Pages` workflow.

The Vite base path uses the exact repository name inside GitHub Actions.

## Backend

GitHub Pages cannot host a persistent backend. Deploy Supabase for:

- PostgreSQL
- Auth
- Edge Functions
- Scheduled synchronization
- AI processing
- server-side secret storage

Apply migrations:

```bash
supabase db push
```

Deploy the sync function:

```bash
supabase functions deploy sync
```

The support importer uses the built-in `SUPABASE_URL`, `SUPABASE_SECRET_KEYS`
and legacy `SUPABASE_SERVICE_ROLE_KEY` environment variables. Do not put secrets in the
frontend. Apply `0003_sync_service_permissions.sql` before running the importer.

For dashboard deployment, replace the function editor's `index.ts` with
`supabase/functions/sync/index.ts`, then deploy as `sync`. After deploying this
version, disable gateway JWT verification to support non-JWT secret API keys.
The function itself checks the `apikey` header against its configured secret
keys before any database access; legacy service-role bearer tokens also work.
Test with POST body `{"source":"support"}` and the dashboard's Add secret key
header option. Never use the public publishable key to invoke
this privileged function. Do not share or paste the service-role key in chat.

The importer currently supports public English support articles only. It stores
original HTML in `source_records`; consumers must not render it as unsanitized
HTML. It does not classify articles into bugs or populate the frontend views.
Other connectors are not implemented and `source: "all"` reports them as skipped.
An unchanged second run should return `changed: 0`. Failed requests return a
non-2xx status and are recorded in sync logs when database access is available.

Future connectors may require these secrets (not needed for support import):

```bash
supabase secrets set OPENAI_API_KEY=...
supabase secrets set REDDIT_CLIENT_ID=...
supabase secrets set REDDIT_CLIENT_SECRET=...
supabase secrets set GITHUB_TOKEN=...
supabase secrets set DISCORD_BOT_TOKEN=...
supabase secrets set DISCORD_GUILD_ID=...
supabase secrets set PRODUCTBOARD_API_KEY=...
```

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` may be exposed to the frontend.

## Scheduled Sync

Use Supabase scheduled functions or GitHub Actions calling the Edge Function URL with a server-side token. Recommended intervals:

- Reddit: 30 minutes
- GitHub: 30 minutes
- Productboard: 2 hours
- Support: 6 hours
- Release notes: 6 hours
- Status page: 15 minutes
- Blog: 6 hours

Discord should be event-based through an authorized bot where possible.
