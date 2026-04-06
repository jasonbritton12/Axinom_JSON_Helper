# Static Site

Current static-web direction for the Axinom Ingest JSON Helper.

Files:
- `site/index.html`: self-contained `v2.0.0` single-page app
- `site/icon.png`: icon referenced by the page header

This site is intentionally standalone and does not depend on the legacy Python helper runtime in `webapp/`.
The current `v2.0.0` static implementation ships only the `Single Title` workflow; `Bulk Excel` and `Direct Sheet` are visible but disabled in the UI.
