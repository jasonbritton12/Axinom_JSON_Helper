# Session Handoff - Axinom Ingest Helper

Date: 2026-02-20

## Implemented

- Built standalone local web app in `webapp/`:
  - Single-title form
  - Bulk Excel converter
  - Direct spreadsheet-style entry tab
- Added template download endpoint and buttons.
- Added conditional field visibility by program type.
- Added dynamic required-field markers (bold + asterisk).
- Added JSON syntax highlighting in preview and visual wrapping to prevent page width overflow.
- Added localization and trailer fields in converter.
- Removed `TRAILER` and `EXTRA` from selectable program types.
  - Legacy spreadsheet values (`TRAILER`, `EXTRA`, `PREVIEW`) auto-map to `MOVIE` for compatibility.
- Added clearer error handling for legacy Python `openpyxl` script.

## Key Files

- `webapp/server.py`
- `webapp/ingest_converter.py`
- `webapp/xlsx_reader.py`
- `webapp/program_types.json`
- `webapp/static/index.html`
- `webapp/static/app.js`
- `webapp/static/styles.css`
- `webapp/README.md`
- `TemplateGenerator_PythonScript/import_openpyxl.py`
- `TemplateGenerator_PythonScript/requirements.txt`

## Run

```bash
cd /Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates
python3 webapp/server.py
```

If port 8080 is busy:

```bash
AXINOM_HELPER_PORT=8090 python3 webapp/server.py
```

## Known Constraints

- Runtime could not read `/Users/jasonbritton/Documents/PDF_Collections/AXINOM_PDFs` due to OS permission restrictions.
- Validation currently follows provided ingest schema in workspace and mapped compatibility rules in `program_types.json`.

## Suggested Next Steps

1. Add strict JSON-schema validation output for both single and bulk/direct workflows.
2. Add relationship integrity checks across batch items (parent/child chain + duplicate `external_id`).
