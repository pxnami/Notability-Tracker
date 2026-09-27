# Notability Tracker

An independent, source-backed tracker for Notability bugs, documented fixes, feature requests, roadmap stages, and development updates.

[Live website](https://pxnami.github.io/Notability-Tracker/)

## Features

- Searchable bugs and fixes with original evidence and source links.
- Official feature-board stages, roadmap, and published development updates.
- Structured iOS release notes without inferred release dates.
- Source health, collection timestamps, and observed status-change history.
- Local bookmarks, JSON exports, light/dark themes, and responsive navigation.
- Public-source refresh every six hours through GitHub Actions; optional Supabase read integration.

## Development

```sh
npm ci
node scripts/collect.mjs
npm run dev
```

The committed public snapshot works without credentials. Optional frontend configuration uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; never expose a service-role or secret key.

```sh
npm run lint
npm test
npm run build
```

React, TypeScript, Vite, React Query, and Supabase. Hash routing supports GitHub Pages deep links. See [deployment](DEPLOYMENT.md) and [source methodology](INTEGRATIONS.md).

## Attribution

Independent project, not affiliated with Notability or Ginger Labs. Notability's icon and name identify the tracked product. Archivo Black is distributed through Fontsource under its bundled license. The interface takes visual inspiration from Notability's public website while clearly identifying itself as unofficial.
