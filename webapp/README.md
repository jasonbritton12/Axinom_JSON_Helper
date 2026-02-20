# Axinom Ingest JSON Helper (No Dependencies)

Standalone local web app for creating Axinom ingest JSON.

## Features

- `Single Title` tab: form-based item creation with program-type-specific field visibility.
- `Bulk Excel` tab: upload `.xlsx` and convert rows to a single ingest JSON document.
- `Direct Sheet` tab: spreadsheet-like in-browser entry and conversion.
- `Template Download`: download `axinom_ingest_template_v1_1_0.xlsx` or `v1_0_0`.
- Date pickers (`date`, `datetime-local`) with manual entry support.
- Picklists/datalists for program type, language tag, country code, and video profile.

## Run

```bash
cd /Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates
python3 webapp/server.py
```

Open `http://127.0.0.1:8080`.

If `8080` is in use:

```bash
AXINOM_HELPER_PORT=8090 python3 webapp/server.py
```

## Program Types

Rules live in `/Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates/webapp/program_types.json`.

- Supported types: `MOVIE`, `TVSHOW`, `SEASON`, `EPISODE`
- Legacy spreadsheet values such as `TRAILER`, `EXTRA`, and `PREVIEW` are auto-mapped to `MOVIE` during conversion for compatibility.

## Supported Extra Fields

- `localizations` (single entry in UI):
  - `language_tag`
  - `title`
  - `description`
  - `synopsis`
- `trailers` (single entry in UI):
  - `source`
  - `profile`

## API Endpoints

- `GET /api/health`
- `GET /api/config`
- `GET /api/picklists`
- `GET /api/template-download?version=latest|v1_1_0|v1_0_0`
- `POST /api/single`
- `POST /api/convert-excel`
- `POST /api/convert-rows`

## Existing Script Fix

The original script now fails with a clear message if dependency is missing:

- `/Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates/TemplateGenerator_PythonScript/import_openpyxl.py`

Install dependency for that script with:

```bash
python3 -m pip install -r /Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates/TemplateGenerator_PythonScript/requirements.txt
```
