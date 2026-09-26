# Notability Tracker

Independent, unofficial Notability community intelligence dashboard.

The frontend is a Vite + React + TypeScript application built for GitHub Pages. Secret-bearing synchronization, AI classification, database writes, and connector work belong in Supabase Edge Functions.

## Current Status

- Static dashboard, routes, responsive navigation, light/dark mode, language toggle, source health, bug tracker, feature requests, roadmap, release notes, community feed, and settings pages are implemented.
- PostgreSQL schema, RLS read policies, search indexes, sync job tables, subscriptions, notifications, and audit logs are included under `supabase/migrations`.
- Supabase Edge Function scaffold separates official, community, and AI-derived data and refuses to fabricate unavailable integrations.
- Seeded UI records are clearly marked as awaiting live synchronization.

## Local Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run typecheck
npm run test
npm run build
```

## GitHub Pages

The deployment workflow is in `.github/workflows/deploy.yml`. It builds the static frontend and deploys `dist` using GitHub's official Pages workflow. Hash routing is used so GitHub Pages supports direct route navigation.

## Unofficial Notice

This project is independent and is not affiliated with Notability or Ginger Labs.
