# Axinom Ingest JSON Helper (No Dependencies)

Standalone local web app for creating Axinom ingest JSON.

## Features

- `Single Title` tab: form-based item creation with program-type-specific field visibility.
- `Single Title` includes ingest mode selection: `Simple (Minimum)` or `Full`.
- `Bulk Excel` tab: upload `.xlsx` and convert rows to a single ingest JSON document.
- `Direct Sheet` tab: spreadsheet-like in-browser entry and conversion.
- `Template Download`: download `axinom_ingest_template_v1_5_3.xlsx` (latest), `v1_5_2`, `v1_5_1`, `v1_5_0`, `v1_4_0`, `v1_3_0`, `v1_2_0`, `v1_1_0`, or `v1_0_0`.
- Date pickers (`date`, `datetime-local`) with manual entry support.
- Multi-select country pickers and profile picklists in UI.
- Dark theme is default, with a persistent light/dark toggle.
- Packaged desktop mode now keeps the helper alive for a working session by default, exposes runtime status in-app, and supports browser-shell refresh recovery plus relaunch through the desktop protocol link.

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

Hosted environments can provide `PORT`, `WEBSITES_PORT`, or `SERVER_PORT`; the app now honors those automatically and binds to `0.0.0.0` when launched directly.

## Program Types

Rules live in `/Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates/webapp/program_types.json`.

- Supported types: `MOVIE`, `TVSHOW`, `SEASON`, `EPISODE`, `TRAILER`, `EXTRA`
- Legacy spreadsheet aliases such as `TRAILERS`, `EXTRAS`, and `PREVIEW` are normalized during conversion for compatibility.
- `Parent Type` is a helper validation field for parent-linked records. It is required for `TRAILER` and `EXTRA`, and supported in the bulk/direct template for clearer relationship entry.

## Supported Extra Fields

- `trailers` (single entry in UI):
  - `source`
  - `profile`

## API Endpoints

- `GET /api/health`
- `GET /api/config`
- `GET /api/picklists`
- `GET /api/runtime`
- `GET /api/template-download?version=latest|v1_5_3|v1_5_2|v1_5_1|v1_5_0|v1_4_0|v1_3_0|v1_2_0|v1_1_0|v1_0_0`
- `POST /api/single`
- `POST /api/convert-excel`
- `POST /api/convert-rows`
- `POST /api/quit` (optional desktop runtime endpoint)

## macOS Installer Packaging

Build a double-click installer package for end users (no terminal/python required for them):

```bash
cd /Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates
./release/macos/build_macos_release.sh
```

Optional explicit version:

```bash
./release/macos/build_macos_release.sh 1.0.0
```

Outputs:

- `/Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates/release/macos/dist/AxinomIngestHelper-<version>.pkg`
- `/Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates/release/macos/dist/AxinomIngestHelper-<version>-README.txt`

## Existing Script Fix

The original script now fails with a clear message if dependency is missing:

- `/Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates/TemplateGenerator_PythonScript/import_openpyxl.py`

Install dependency for that script with:

```bash
python3 -m pip install -r /Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates/TemplateGenerator_PythonScript/requirements.txt
```

## Azure App Service

Repository-side deployment scaffolding lives here:

- `/Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates/.github/workflows/deploy-azure-webapp.yml`
- `/Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates/startup.sh`
- `/Users/jasonbritton/Desktop/AXINOM_SETUP/JSON_Ingest_Templates/deploy/azure/README.md`

The remaining setup is Azure-side:

- create the Linux App Service
- set startup command to `bash startup.sh`
- add GitHub repo variable `AZURE_WEBAPP_NAME`
- add GitHub repo secret `AZURE_WEBAPP_PUBLISH_PROFILE`
