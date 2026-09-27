# Sources and Methodology

## Connected Public Sources

- [Support](https://support.gingerlabs.com/): paginated public English Zendesk articles, retaining original URLs and published/updated timestamps.
- [Recently Reported Issues](https://support.gingerlabs.com/hc/en-us/articles/360035063091): headings under Ongoing Issues and Fixed Issues become tracker records. Fixed status is assigned only to the fixed section. Investigation status requires explicit wording. Unknown severity/platform stay unknown.
- [Latest iOS App Updates](https://support.gingerlabs.com/hc/en-us/articles/9414165465882): version headings and release bullets are extracted. Article modification time is not a release date. Only explicitly marked fixes are categorized as fixes.
- [Official feature board](https://portal.productboard.com/gingerlabs/1-notability/tabs/14-actively-considering): public embedded board data supplies original stages, cards, descriptions, and posted updates. Hidden vote counts are not displayed. Popularity never implies planned work.
- [Ginger Labs on GitHub](https://github.com/Ginger-Labs): public repositories are filtered for explicit Notability relevance. Repository activity is not proof of an app fix or access to private development.

The collector is `scripts/collect.mjs`; parsing and evidence rules live in `scripts/parsers.mjs` with regression tests. External descriptions are rendered as text, not arbitrary HTML. Every record links back to its source.

## Freshness and History

Collection time, source update time, and release dates are distinct. Source health includes failures and last-success timestamps. Failures preserve last-known records; they do not create successful refresh timestamps. Sources older than 24 hours are marked stale in the interface.

Status history records changes observed between committed snapshots only. It does not reconstruct historical transitions or claim the observation timestamp is the exact time a developer changed the status.

## Not Connected

Reddit requires authorized API access and is marked accordingly. Discord, private GitHub development, AI classification, notifications, and subscriptions are not presented as working integrations. Existing database scaffolding does not imply those services are live.

Supabase remains an optional additional read source. The server-side support importer stores raw source articles, while the public collector extracts the structured views. No service-role key is needed by the browser or public collection workflow.
