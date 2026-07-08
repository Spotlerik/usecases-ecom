# The Use Case Menu — Spotler Activate

Interactive use-case explorer for sales reps: 18 Spotler Activate use cases,
filterable by outcome course, challenge, type, setup, needs and lifecycle
stage, with a live industry switch (Commerce / Travel / Culture), a
cards/table toggle, a detail drawer with mockup previews, an EN/NL toggle,
and a "build a pitch" shortlist. Open `index.html` directly in a browser —
no server, no build step needed.

## Build
- Plain HTML/CSS/JS, hash-routed (industry, filters and the open card persist
  in the URL so a rep can share a filtered link). Runs from `file://`.
- `index.html` — page shell, fonts, base styles, script tags.
- `app.js` — a single React component: filtering, i18n, cards/table
  rendering, the detail drawer, the pitch tray.
- `vendor/` — React + ReactDOM (production UMD builds), vendored locally so
  the page has no external CDN dependency at runtime.
- `use_cases.json` — the source data (18 use cases, courses, challenges,
  industries, brand tokens).
- `use_cases.js` — same data as `window.USE_CASES` (loaded via `<script>` so
  the app reads it without `fetch()`, which browsers block on `file://`).
- `strings_nl.js` — Dutch translations, keyed by the exact English source
  string (`window.NL_STRINGS`).
- `uc-mockups.js` — a `<uc-mockup>` web component that renders a small
  illustrative screen (email, on-site banner, dashboard, …) per use case,
  reused inside the detail drawer.
- `assets/logo.svg` — header mark. This is a placeholder recreation of the
  concentric-circle "Spotler Activate" lockup — the real spotler.com logo
  could not be fetched from the build sandbox (network egress to spotler.com
  was blocked there). Drop in the real SVG at the same path to replace it.

## Content rules
Data-driven from `use_cases.json` — names, problems, mechanisms and metrics
are never reworded or invented outside that file. The disclaimer in the
footer (`meta.disclaimer`) must stay visible: benchmarks are illustrative and
should be validated per prospect.

## Fonts
Open Sans via Google Fonts; degrades gracefully to system fonts offline.
