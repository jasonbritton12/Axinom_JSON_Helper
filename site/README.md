# Static Site

Current static-web direction for the Axinom Ingest JSON Helper.

Files:
- `index.html`: self-contained static single-page app entrypoint at repo root
- `site/app.js`: browser-side logic for single-title, bulk Excel, and direct-sheet workflows
- `site/icon.png`: icon referenced by the page header

This site is intentionally standalone and is now the primary app implementation in the repository.
The current static implementation keeps conversion logic in the browser so uploads and direct-sheet entry do not require a backend service.
