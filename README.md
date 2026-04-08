# Axinom Ingest JSON Helper

Current direction: static web app.

## Active Source

- `site/index.html`: self-contained static application
- `site/icon.png`: icon used by the site
- `site/README.md`: site-specific notes

## Reference Material

- `docs/reference/`: Axinom schemas, examples, and historical template files
- `docs/app-requirements-v1.5.4.md`: historical requirements snapshot from the pre-static implementation
- `docs/ux-review-2026-03-26.md`: historical UX review notes

## Repo Cleanup

The previous Python server, desktop launcher, Azure deployment scaffolding, Excel-template generator scripts, and macOS packaging source were removed from the active repo layout after the move to the standalone static-site approach.

If older implementation details are needed, use git history and prior tags.

## Local Preview

```bash
python3 -m http.server 8080 -d site
```

Open:

- `http://127.0.0.1:8080`

## Releases

Static-site releases are published from the `site/` source and may include downloadable bundles such as the `v2.0.0` release assets.
