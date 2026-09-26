# Deployment

## Frontend

1. Create or reuse a GitHub repository named `notability-tracker`.
2. Push this project to the repository's `main` branch.
3. In GitHub repository settings, set Pages source to GitHub Actions.
4. Run the `Deploy GitHub Pages` workflow.

The Vite base path automatically becomes `/notability-tracker/` inside GitHub Actions.

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

Set secrets:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
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
