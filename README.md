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
[`docs/reference/axinom_ingest_template_v2_2_0.xlsx`](docs/reference/axinom_ingest_template_v2_2_0.xlsx).

## External IDs and video profiles

- Leave External ID blank when the required title or series hierarchy and Studio are available; the helper generates it in the browser.
- Entering an External ID creates a manual override that the helper preserves.
- CVP workbooks may label Studio as `Provider` or `Content Provider`; both map to Axinom Studio metadata.
- New video-bearing entries default to `HLS-DASH_Non-DRM`. The active profiles are `HLS-DASH_Non-DRM`, `HLS-DASH_DRM`, `LAS_HLS-DASH_Non-DRM`, and `LAS_HLS-DASH_DRM`. Explicit profiles from older workbooks are preserved instead of migrated; `LAS_CMAF_File_Non-DRM` remains compatible for imports and is never silently migrated.
- Episode-number and External-ID suffix mismatches are warnings, so review them before ingest.

`PODCAST`, `PODCAST_SEASON`, and `PODCAST_EPISODE` are available for experimental testing and use a `P_` External ID hierarchy. Validate those exact types in the intended Axinom environment before production use.

## Data handling

Workbook parsing and JSON generation run locally in the browser. Selected
files and generated JSON are not transmitted to an application backend.

Operators should review generated documents and validate them in the intended
environment before a production ingest.

Generated JSON is derived from the inputs at conversion time. If those inputs
change, regenerate the output before using it. Large warning sets are summarized
with bounded representative details. Direct Sheet controls retain accessible row
and column context, including sticky identifiers. XLSX decompressed content is
streamed and bounded during local parsing.

## Local use

Serve the directory over HTTP:

```bash
python3 -m http.server 8080
```

Then open `http://127.0.0.1:8080`.

## Security

Report suspected vulnerabilities through the confidential channel described in
[SECURITY.md](SECURITY.md).
