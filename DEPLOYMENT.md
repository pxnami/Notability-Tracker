# Deployment

## GitHub Pages

Set the repository's Pages source to GitHub Actions. `.github/workflows/deploy.yml` runs on main pushes, manual dispatch, and every six hours (17 minutes past the hour, UTC). Scheduled runs may be delayed by GitHub.

The workflow installs dependencies, lints, tests, collects public sources, commits only the updated snapshot/history, builds, and deploys `dist`. It needs repository contents write, Pages write, and identity-token permissions. The Vite base path uses the exact GitHub repository name. Hash routing needs no server redirects.

Failed sources retain their last successful records and display a failure state. If every source fails, collection exits unsuccessfully and the existing deployment remains available. Snapshots are committed so observed changes survive later builds.

## Optional Supabase Integration

Only `VITE_SUPABASE_URL` and the public `VITE_SUPABASE_ANON_KEY` belong in frontend configuration. The UI combines public snapshots with readable database records and continues with either when one fails. Database writes require server-side authorization and row-level security.

The existing support importer remains available:

```sh
supabase db push
supabase functions deploy sync
```

Apply the included migrations, including service permissions, before importing. The function checks configured secret `apikey` headers or legacy service-role bearer tokens. For non-JWT secret keys, disable gateway JWT verification only when this function's own authorization checks are deployed. Test with POST `{"source":"support"}`. An unchanged second run returns `changed: 0`.

`.github/workflows/sync.yml` is an optional manual importer, not the default refresh mechanism. Configure its variables and server-side secret before use. Never put privileged keys in GitHub Pages, commits, screenshots, or chat. The public collector requires no privileged credentials.
