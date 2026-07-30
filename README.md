# Axinom Ingest JSON Helper

Use the [Axinom Ingest JSON Helper](https://jasonbritton12.github.io/Axinom_JSON_Helper/)
to prepare ingest JSON in a browser.

## Available workflows

- **Single Title** — build one ingest item with guided fields.
- **Bulk Excel** — convert a supported `.xlsx` workbook into ingest JSON.
- **Direct Sheet** — enter multiple rows in the browser and convert them
  without preparing a workbook first.

## Quick start

1. Open the helper and choose a workflow.
2. Enter title data, upload a workbook, or add rows in Direct Sheet.
3. Review the validation status and generated JSON.
4. Download or copy the JSON for the intended ingest process.

The current workbook is available from the helper's **Download Template**
button or at
[`docs/reference/axinom_ingest_template_v2_1_2.xlsx`](docs/reference/axinom_ingest_template_v2_1_2.xlsx).

## Data handling

Workbook parsing and JSON generation run locally in the browser. Selected
files and generated JSON are not transmitted to an application backend.

Operators should review generated documents and validate them in the intended
environment before a production ingest.

## Local use

Serve the directory over HTTP:

```bash
python3 -m http.server 8080
```

Then open `http://127.0.0.1:8080`.

## Security

Report suspected vulnerabilities through the confidential channel described in
[SECURITY.md](SECURITY.md).
