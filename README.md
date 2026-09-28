<div align="center">
  <img src="public/notability.png" width="72" height="72" alt="Notability Tracker icon">
  <h1>Notability Tracker</h1>
  <p>Public issues, fixes, feature requests, roadmap stages, and release notes in one source-backed view.</p>
  <p>
    <a href="https://pxnami.github.io/Notability-Tracker/"><img src="https://img.shields.io/badge/Open%20tracker-20201e?style=for-the-badge" alt="Open Notability Tracker"></a>
    <a href="https://github.com/pxnami/Notability-Tracker/issues"><img src="https://img.shields.io/badge/Report%20an%20issue-4d8eff?style=for-the-badge" alt="Report an issue"></a>
  </p>
</div>

Notability Tracker is an independent web application that collects and presents publicly available information about Notability. Every tracked item links to its original source. The project is not affiliated with Notability or Ginger Labs.

## Features

- Search and filter documented issues and fixes.
- Browse the public feature board by its original roadmap stages.
- Review structured iOS release notes and published development updates.
- Inspect source health, collection times, and observed status changes.
- Save records locally and export filtered results as JSON.
- Use the responsive interface in light or dark mode.
- Continue reading the last public snapshot when an upstream source is temporarily unavailable.

## Technology

- React 18 and TypeScript
- Vite and React Router
- TanStack Query
- Supabase client, PostgreSQL migrations, and an optional Edge Function importer
- Cheerio and Marked for build-time source parsing
- Vitest and Testing Library
- GitHub Actions and GitHub Pages

## Architecture

The application has two data paths:

1. `scripts/collect.mjs` fetches public sources during deployment, parses them with `scripts/parsers.mjs`, and writes `public/data/public-feed.json`.
2. The browser loads that committed snapshot and, when configured, public Supabase records. `src/data/live.tsx` validates, sanitizes, merges, and exposes the result to the React pages. Snapshot records take precedence when duplicate records are found.

GitHub Actions runs the public collector and deployment every six hours. Source failures retain the most recent successful records and are reported in the interface. The optional Supabase Edge Function imports public support articles into PostgreSQL using server-side credentials.

```text
public/data/            Generated public snapshot
scripts/                Source collection, parsers, and parser tests
src/components/         Shared interface components
src/data/               Data loading and merge boundary
src/lib/                Supabase and local preference utilities
src/pages/              Route-level views
supabase/functions/     Optional support importer
supabase/migrations/    Database schema and access policies
```

## Installation

Node.js 22 or newer is required.

```sh
git clone https://github.com/pxnami/Notability-Tracker.git
cd Notability-Tracker
npm ci
npm run dev
```

The committed snapshot allows the application to run without external credentials. To include public database records, copy `.env.example` to `.env.local` and set:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-key
```

Do not expose a Supabase service-role key or secret key to the frontend.

## Development

```sh
npm run collect     # Refresh the public snapshot
npm run lint        # Run ESLint
npm run typecheck   # Check TypeScript
npm test            # Run the test suite
npm run build       # Create the production build
npm run preview     # Preview the production build
```

Collector output is intentionally committed. This supplies a fallback for GitHub Pages and provides the previous snapshot needed to record observed status transitions.

## Data Sources

| Source                                                                                                           | Collected data                                         | Method                     |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------- |
| [Notability Support](https://support.gingerlabs.com/)                                                            | Public English support articles                        | Paginated Zendesk API      |
| [Recently Reported Issues](https://support.gingerlabs.com/hc/en-us/articles/360035063091)                        | Ongoing and fixed issues                               | Structured article parsing |
| [Latest iOS App Updates](https://support.gingerlabs.com/hc/en-us/articles/9414165465882)                         | Version headings, changes, and explicit fixes          | Structured article parsing |
| [Notability Feature Board](https://portal.productboard.com/gingerlabs/1-notability/tabs/14-actively-considering) | Public cards, stages, and posted updates               | Embedded public board data |
| [Ginger Labs GitHub](https://github.com/Ginger-Labs)                                                             | Public repositories with explicit Notability relevance | GitHub public API          |

The scheduled workflow checks these sources every six hours. Collection time, upstream modification time, and release date remain separate values. A status-history entry means the project observed a change between snapshots; it does not establish the exact time the upstream status changed.

The parsers preserve source wording and URLs. They do not infer release dates, private development activity, roadmap commitments, or hidden vote counts. External HTML is converted to text before display.

## Deployment

`.github/workflows/deploy.yml` tests, collects, builds, and deploys the application to GitHub Pages on pushes to `main`, manual runs, and the six-hour schedule. The workflow commits a new snapshot only when source content or status changes; collection-only timestamps do not create repository commits.

GitHub Pages must use **GitHub Actions** as its deployment source. The Vite base path is derived from `GITHUB_REPOSITORY`, and hash routing supports direct navigation without server rewrites.

`.github/workflows/sync.yml` is a separate manual workflow for the optional Supabase importer. It requires `SUPABASE_SYNC_URL` as a repository variable and `SUPABASE_SYNC_TOKEN` as a repository secret.

## Limitations

- The tracker reflects public sources and does not provide access to private Notability development information.
- Reddit is displayed as unavailable because authorized Reddit API access is not configured.
- Productboard stages are reproduced as published and are not delivery commitments.
- Release dates remain unspecified when the source does not publish one.
- Local bookmarks are stored in the browser and are not synchronized between devices.
- The Supabase schema includes supporting tables that are not exposed as user-facing account or notification features.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and data-integrity requirements.

## License and Attribution

No software license is currently provided. The repository is publicly readable, but no permission to copy, modify, or redistribute its contents is granted by default.

Notability is a trademark of Ginger Labs. Its name and icon are used only to identify the product being tracked. Interface symbols are from the [Icons8 Apple SF Symbols](https://icons8.com/icons/family-sf-symbols) family. Paytone One, Nunito Sans, and Source Serif 4 are distributed through Fontsource under their included upstream licenses.
