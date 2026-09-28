# Contributing

Contributions should preserve the tracker's source-backed behavior and existing visual language.

## Development Workflow

1. Create a focused branch from `main`.
2. Install dependencies with `npm ci` using Node.js 22 or newer.
3. Make the smallest change needed and add tests for parsing or behavioral changes.
4. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
5. Open a pull request that explains the behavior changed and the checks performed.

Do not commit `.env` files, credentials, service-role keys, generated build output, or unrelated formatting changes.

## Data Integrity

- Link records to the original public source.
- Preserve published statuses and wording where practical.
- Do not infer release dates, fixes, roadmap commitments, popularity, or private development activity.
- Keep collection time separate from source publication and modification times.
- Treat community reports as distinct from official statements.
- Add or update parser fixtures when an upstream document structure changes.
- Render external content as sanitized text rather than untrusted HTML.

## Scope

Bug fixes, accessibility improvements, tests, documentation corrections, and reliable public-source integrations are in scope. Large interface redesigns, speculative data, credential-dependent integrations without a maintenance plan, and unrelated platform features should be discussed before implementation.

This repository currently has no software license. A contribution does not change that status or grant broader reuse rights.
