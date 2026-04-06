# Axinom Ingest Helper Rebuild Requirements

Version target: `v1.5.4`  
Release label target: `v1.5.4 (2026-04-02)`  
Document purpose: define the current app's shipped behavior closely enough that a new team could recreate it at feature parity without relying on the existing implementation.

## 1. Scope And Parity Rule

This document describes the current product behavior implemented in:

- `webapp/static/index.html`
- `webapp/static/app.js`
- `webapp/static/styles.css`
- `webapp/static/service-worker.js`
- `webapp/server.py`
- `webapp/ingest_converter.py`
- `webapp/xlsx_reader.py`
- `webapp/program_types.json`
- `webapp/desktop_launcher.py`
- `release/macos/build_macos_release.sh`

Parity requirement:

- A rebuilt app must match current functionality, defaults, workflow structure, output shape, and supported runtime modes.
- Missing features in the current app must remain out of scope unless intentionally added in a later phase.
- Known quirks that materially affect user behavior must be preserved or intentionally replaced with documented alternatives.

## 2. Product Summary

The app is a single-page helper for generating Axinom ingest JSON through three workflows:

1. `Single Title`: guided form for one ingest item.
2. `Bulk Excel`: upload an `.xlsx` template and convert rows to one JSON document.
3. `Direct Sheet`: type values directly into an in-browser spreadsheet grid and convert rows to one JSON document.

The app can run in two modes:

- `Web` mode: Python server + browser.
- `Desktop` mode: packaged/local launcher that starts the helper server, opens the browser, exposes runtime status, and can be relaunched through a custom protocol.

The app does not persist user data. It generates JSON in memory and lets the user copy or download it.

## 3. Target UX And Layout

### 3.1 Single-Page Layout

The app must render as one page with these major sections:

1. Hero/header card
2. Workflow card containing three tabs
3. Output card containing status, formatted JSON, and export actions

The page must be responsive and remain usable on desktop and mobile.

### 3.2 Hero Section

The hero must contain:

- Title: `Axinom Ingest JSON Helper`
- Subtitle describing the three workflows
- Release label text
- Theme toggle button
- Runtime banner

### 3.3 Theme Behavior

The app must:

- default to `dark` theme
- support `light` theme
- persist theme in `localStorage` key `axinom_ingest_theme`
- update the root element with `data-theme="dark"` or `data-theme="light"`
- update the button label to `Use Light Theme` in dark mode and `Use Dark Theme` in light mode

### 3.4 Runtime Banner

The runtime banner must show:

- current connectivity state
- inferred runtime mode: `Desktop App`, `Web App`, or `Helper`
- optional idle timeout summary
- `Retry Connection` button
- `Relaunch Desktop App` button

The relaunch button must be shown only when the app believes desktop mode is active or was last active.

The frontend must remember the last successful runtime mode in `localStorage` key `axinom_ingest_runtime_mode` and use that remembered value when the helper later becomes unavailable.

## 4. Core Workflows

## 4.1 Workflow Tabs

The app must expose exactly three tabs:

- `Single Title`
- `Bulk Excel`
- `Direct Sheet`

Current behavior to preserve:

- `Single Title` is active by default.
- Clicking a tab swaps visible panel content without a page reload.
- The current implementation does not provide full ARIA tab semantics; parity does not require accessibility improvements unless separately scoped.

## 4.2 Single Title Workflow

### 4.2.1 Header And Metadata Controls

The `Single Title` panel must include:

- `Document Name`
- `Document Description`
- `Document Created` display, read-only, initialized to `Auto-stamped when JSON is generated`

Defaults:

- name default after initialization: auto-suggested from current field state
- description default after initialization: auto-suggested from current field state
- `Document Created` is not user-editable

### 4.2.2 Top-Level Required Controls

The workflow must always show:

- `Program Type` select
- `Ingest Mode` select
- `External ID` input

Program type options:

- `MOVIE`
- `TVSHOW`
- `SEASON`
- `EPISODE`
- `TRAILER`
- `EXTRA`

Ingest mode options:

- `SIMPLE` labeled `Simple (Minimum)`
- `FULL` labeled `Full`

Important parity note:

- `ingest_mode` is a frontend-only aid.
- The current backend accepts the field in the request but does not use it in conversion logic.

### 4.2.3 Single-Item Field Catalog

The single form must include controls for these field ids:

- `title`
- `original_title`
- `description`
- `synopsis`
- `released`
- `studio`
- `index`
- `parent_type`
- `parent_external_id`
- `genres`
- `tags`
- `cast`
- `production_countries`
- `license_start`
- `license_end`
- `license_countries`
- `video_source`
- `video_profile`
- `trailer_source`
- `trailer_profile`
- `cover_image`
- `teaser_image`

Control types:

- date input: `released`
- datetime-local input: `license_start`, `license_end`
- number input: `index`
- single select: `parent_type`
- multi-select: `production_countries`, `license_countries`
- textarea: `description`, `synopsis`
- text input: all others

### 4.2.4 Single-Item Visibility Rules

The UI must show and hide fields based on `Program Type` and `Ingest Mode`.

`FULL` mode field visibility:

- `MOVIE`: `title`, `original_title`, `description`, `synopsis`, `released`, `studio`, `genres`, `tags`, `cast`, `production_countries`, `license_start`, `license_end`, `license_countries`, `video_source`, `video_profile`, `trailer_source`, `trailer_profile`, `cover_image`, `teaser_image`
- `TVSHOW`: `title`, `original_title`, `description`, `synopsis`, `released`, `studio`, `genres`, `tags`, `cast`, `production_countries`, `license_start`, `license_end`, `license_countries`, `trailer_source`, `trailer_profile`, `cover_image`, `teaser_image`
- `SEASON`: `description`, `synopsis`, `released`, `studio`, `index`, `parent_external_id`, `genres`, `tags`, `cast`, `production_countries`, `license_start`, `license_end`, `license_countries`, `trailer_source`, `trailer_profile`, `cover_image`, `teaser_image`
- `EPISODE`: `title`, `original_title`, `description`, `synopsis`, `released`, `studio`, `index`, `parent_external_id`, `genres`, `tags`, `cast`, `production_countries`, `license_start`, `license_end`, `license_countries`, `video_source`, `video_profile`, `trailer_source`, `trailer_profile`, `cover_image`, `teaser_image`
- `TRAILER`: `title`, `original_title`, `description`, `synopsis`, `released`, `studio`, `parent_type`, `parent_external_id`, `genres`, `tags`, `cast`, `production_countries`, `license_start`, `license_end`, `license_countries`, `video_source`, `video_profile`, `cover_image`, `teaser_image`
- `EXTRA`: `title`, `original_title`, `description`, `synopsis`, `released`, `studio`, `parent_type`, `parent_external_id`, `genres`, `tags`, `cast`, `production_countries`, `license_start`, `license_end`, `license_countries`, `video_source`, `video_profile`, `trailer_source`, `trailer_profile`, `cover_image`, `teaser_image`

`SIMPLE` mode field visibility:

- `MOVIE`: `title`, `video_source`, `video_profile`
- `TVSHOW`: `title`
- `SEASON`: `index`, `parent_external_id`
- `EPISODE`: `title`, `index`, `parent_external_id`, `video_source`, `video_profile`
- `TRAILER`: `title`, `parent_type`, `parent_external_id`, `video_source`, `video_profile`
- `EXTRA`: `title`, `parent_type`, `parent_external_id`, `video_source`, `video_profile`

### 4.2.5 Required-Field Behavior

The UI must display a required-fields summary box and required markers on visible labels.

Backend/config-driven required fields by type:

- `MOVIE`: `external_id`, `title`
- `TVSHOW`: `external_id`, `title`
- `SEASON`: `external_id`, `index`, `parent_external_id`
- `EPISODE`: `external_id`, `title`, `index`, `parent_external_id`
- `TRAILER`: `external_id`, `title`, `parent_type`, `parent_external_id`
- `EXTRA`: `external_id`, `title`, `parent_type`, `parent_external_id`

Frontend-only `SIMPLE` mode additional requirements:

- `MOVIE`: require `video_source` and `video_profile`
- `EPISODE`: require `video_source` and `video_profile`
- `TRAILER`: require `video_source` and `video_profile`
- `EXTRA`: require `video_source` and `video_profile`

The required summary text must read in this pattern:

- `Required for MOVIE (Simple): Title, Main Video Source, Main Video Profile`
- `Required for EPISODE (Full): Title, Episode Index (Episode Number), Parent External ID`

### 4.2.6 Parent Type Behavior

The `Parent Type` select options must be populated dynamically from config:

- `SEASON`: `TVSHOW`
- `EPISODE`: `SEASON`
- `TRAILER`: `MOVIE`, `TVSHOW`, `SEASON`, `EPISODE`, `EXTRA`
- `EXTRA`: `MOVIE`, `TVSHOW`

`MOVIE` and `TVSHOW` have no parent type options.

### 4.2.7 Index Label Behavior

The index label must change by program type:

- `SEASON`: `Season Index (Season Number)`
- `EPISODE`: `Episode Index (Episode Number)`
- all other types: `Index`

### 4.2.8 Date-Time Helper Defaults

For `license_start` and `license_end`, the UI must auto-fill a default time when the user selects a date into an initially blank field:

- `license_start`: append `21:00`
- `license_end`: append `23:59`

This behavior must happen both in the single form and in the direct-sheet grid.

### 4.2.9 Auto-Suggested Document Metadata

The single workflow must auto-suggest `Document Name` and `Document Description` from item fields unless the user has manually overridden them.

Rules:

- Suggestions update when `program_type`, `title`, `index`, `parent_external_id`, or `external_id` changes.
- Once the user types a non-empty custom name or description, auto-sync for that field stops.
- If the user clears a custom name or description, auto-sync resumes.
- Clicking `Clear Form` resets dirty-state and reapplies suggestions.

Suggested subject logic:

- `MOVIE`: use `title`, else humanized `external_id`, else `Movie`
- `TVSHOW`: use `title`, else humanized `external_id`, else `Series`
- `SEASON`: use humanized `parent_external_id`, else `title`, else humanized `external_id`, else `Series`
- `EPISODE`: use humanized series name derived from `parent_external_id`, else `title`, else humanized `parent_external_id`, else humanized `external_id`, else `Series`
- `TRAILER` and `EXTRA`: use `title`, else humanized `parent_external_id`, else humanized `external_id`, else program type

Suggested document names:

- `MOVIE`: `<subject> - Movie Ingest`
- `TVSHOW`: `<subject> - TV Show Ingest`
- `SEASON`: `<subject> - S<index> Ingest` when index exists, else `<subject> - Season Ingest`
- `EPISODE`: `<subject> - S<season> E<episode> Ingest` when both known, else `<subject> - Episode <index> Ingest` when only episode known, else `<subject> - Episode Ingest`
- `TRAILER`: `<subject> - Trailer Ingest`
- `EXTRA`: `<subject> - Extra Ingest`

Suggested descriptions:

- `MOVIE`: `Single-item movie ingest for <subject>.`
- `TVSHOW`: `Single-item TV show ingest for <subject>.`
- `SEASON`: `Single-item season ingest for <subject>.` or `Single-item season ingest for <subject> season <index>.`
- `EPISODE`: `Single-item episode ingest for <subject>.` or a season/episode-specific sentence when indices are known
- `TRAILER`: `Single-item trailer ingest for <subject>.`
- `EXTRA`: `Single-item extra ingest for <subject>.`

Document name limit:

- maximum 50 characters
- truncate with ellipsis before suffix overflow when necessary

### 4.2.10 Form Submission

Clicking `Generate JSON` must:

1. validate frontend-required fields
2. validate document name presence and length
3. POST JSON to `/api/single`
4. render returned JSON into the output panel
5. update download filename stem from document name
6. show success, warning, or error status

Clicking `Clear Form` must:

- reset `Ingest Mode` to `SIMPLE`
- reset `Program Type` to `MOVIE`
- clear all other fields
- clear all multi-select choices
- reset metadata dirty-state
- restore metadata suggestions
- reset document-created displays to the auto-stamp placeholder

## 4.3 Bulk Excel Workflow

### 4.3.1 Fields And Defaults

The `Bulk Excel` panel must contain:

- `Document Name`, default `Axinom Bulk Ingest`
- `Document Description (optional)`
- `Document Created` display, read-only
- `Sheet Name (optional)`
- `Template Version` select
- `.xlsx` file input
- `Convert Excel To JSON` button
- `Download Template` button

### 4.3.2 Template Versions

The template version selector must expose:

- `latest (v1.5.4)` with value `latest`
- `v1.5.4`
- `v1.5.3`
- `v1.5.2`
- `v1.5.1`
- `v1.5.0`
- `v1.4.0`
- `v1.3.0`
- `v1.2.0`
- `v1.1.0`
- `v1.0.0`

### 4.3.3 Conversion Behavior

Clicking `Convert Excel To JSON` must:

1. require a selected `.xlsx` file
2. require a non-empty document name no longer than 50 characters
3. POST `multipart/form-data` to `/api/convert-excel`
4. include fields:
   - `file`
   - `name`
   - `description`
   - `sheet_name` only when user supplied
5. render the returned JSON when conversion succeeds
6. show status summary in this shape:
   - `Converted <items_created> item(s) from <rows_read> row(s) on sheet '<sheet>'.`
7. append warnings to the status when warnings exist

Batch parity rule:

- bulk conversion is all-or-nothing
- if any row fails validation, the response is treated as a failed conversion and no output document is returned, even when some rows were otherwise valid

### 4.3.4 Template Download Behavior

Clicking `Download Template` must navigate the browser to:

- `/api/template-download?version=<selected version>`

## 4.4 Direct Sheet Workflow

### 4.4.1 Fields And Defaults

The `Direct Sheet` panel must contain:

- `Document Name`, default `Axinom Direct Sheet Ingest`
- `Document Description (optional)`
- `Document Created` display, read-only
- a spreadsheet-like table
- `Add Row` button
- `Clear Rows` button
- `Convert Direct Sheet To JSON` button
- `Download Template` button

### 4.4.2 Initial Grid State

On initialization, the direct sheet must:

- render a table with a sticky header row
- include a leftmost row-number column labeled `#`
- create exactly 6 blank rows
- number rows starting from `1`

### 4.4.3 Direct-Sheet Columns

The direct grid must contain these columns in this order:

1. `Asset Type`
2. `External ID`
3. `Title`
4. `Original Title`
5. `Description`
6. `Synopsis`
7. `Released Date`
8. `Studio`
9. `Season/Ep Number`
10. `Parent Type`
11. `Parent External ID`
12. `Genres`
13. `Tags`
14. `Cast`
15. `Production Countries`
16. `License Start (UTC)`
17. `License End (UTC)`
18. `License Countries`
19. `Video Source`
20. `Video Profile`
21. `Cover Image`
22. `Teaser Image`
23. `Trailer Source`
24. `Trailer Profile`

### 4.4.4 Input Types By Column

The direct grid must use:

- select: `Asset Type`
- select: `Parent Type`
- date input: `Released Date`
- datetime-local input: `License Start (UTC)`, `License End (UTC)`
- number input with min `1`: `Season/Ep Number`
- text input with datalist `country-code-list`: `Production Countries`, `License Countries`
- text input with datalist `video-profile-list`: `Video Profile`, `Trailer Profile`
- plain text input: all other columns

### 4.4.5 Dynamic Parent Type Behavior

Within each row:

- changing `Asset Type` must repopulate that row's `Parent Type` options
- available parent types must follow the same config rules as the single-item form

### 4.4.6 Row Management

`Add Row` must append one blank row.

`Clear Rows` must rebuild the table to the original 6 blank rows.

There is no current support for:

- deleting a single row
- duplicating a row
- pasting spreadsheet blocks with custom handling
- inline row or cell error highlighting

### 4.4.7 Conversion Behavior

Clicking `Convert Direct Sheet To JSON` must:

1. require a non-empty document name no longer than 50 characters
2. ignore fully blank rows
3. require at least one non-empty row
4. POST JSON to `/api/convert-rows`
5. include payload:
   - `name`
   - `description`
   - `source: "direct-sheet"`
   - `sheet_name: "Direct Entry"`
   - `rows: [...]`
6. render the returned document when conversion succeeds
7. show status summary in this shape:
   - `Converted <items_created> direct row item(s) from <rows_read> row(s).`

Batch parity rule:

- direct-sheet conversion is all-or-nothing
- if any row fails validation, the response is treated as a failed conversion and no output document is returned, even when some rows were otherwise valid

### 4.4.8 Template Download Quirk To Preserve

Current behavior:

- the `Direct Sheet` download button uses the `Bulk Excel` tab's template-version selector value
- there is no separate template-version selector inside the direct-sheet panel

A parity rebuild must either preserve this behavior or replace it only if the replacement is explicitly approved as a product change.

## 4.5 Output Workflow

The output card must contain:

- status message area
- syntax-highlighted JSON preview
- `Download JSON` button
- `Copy JSON` button

Default rendered JSON before any generation:

```json
{
  "name": "Axinom Ingest",
  "items": []
}
```

Output behavior:

- valid JSON documents must be stored as the current document object and rendered pretty-printed with 2-space indentation
- invalid JSON text must still be renderable as syntax-highlighted text
- export actions must refuse to operate on invalid JSON text

Copy behavior:

- use `navigator.clipboard.writeText`
- show success or failure status

Download behavior:

- download `<sanitized-document-name>.json`
- sanitize the filename stem by replacing filesystem-invalid characters with `-`, collapsing spaces to `_`, and trimming leading/trailing punctuation

## 5. Backend HTTP Requirements

## 5.1 Server Architecture

The backend must be a lightweight HTTP server that:

- serves the static frontend from `/`
- serves JSON APIs under `/api/*`
- disables response caching by sending `Cache-Control: no-store`
- uses concurrent request handling

### 5.2 Bind Address And Port

Direct web-server execution must:

- default host to `0.0.0.0`
- default port to `8080`

The server must honor these environment variables in priority order:

- host: `AXINOM_HELPER_HOST`, then `HOST`
- port: `AXINOM_HELPER_PORT`, then `PORT`, then `WEBSITES_PORT`, then `SERVER_PORT`

## 5.3 API Endpoints

### `GET /api/health`

Response:

- `200`
- body: `{ "ok": true }`

### `GET /api/picklists`

Response fields:

- `ok`
- `video_profiles`
- `image_types`
- `common_country_codes`
- `common_language_tags`

Current values:

- video profiles:
  - `CMAF_File_Non-DRM`
  - `CMAF_File_DRM`
  - `CMAF_File_Non-DRM_SD`
  - `CMAF_File_DRM_SD`
- image types:
  - `COVER`
  - `TEASER`
- common country codes:
  - `US`, `CA`, `GB`, `DE`, `FR`, `AU`, `ES`, `IT`, `SE`, `NL`
- common language tags:
  - `en-US`, `en-GB`, `es-ES`, `fr-FR`, `de-DE`, `it-IT`, `pt-BR`, `sv-SE`

Parity note:

- the current UI uses `video_profiles` and `common_country_codes`
- `image_types` and `common_language_tags` are exposed by the API but not actively rendered in the single-form UI

### `GET /api/config`

Response fields:

- `ok`
- `program_types`
- `required_fields`
- `allowed_parent_types`
- `app_release_label`
- `helper_version`

Expected release values for this parity target:

- `app_release_label`: `v1.5.4 (2026-04-02)`
- `helper_version`: `v1.5.4`

### `GET /api/runtime`

Response fields:

- `ok`
- `mode`: `desktop` or `web`
- `quit_supported`: boolean
- `idle_timeout_seconds`: integer or `null`
- `launcher_protocol`: `axinom-ingest://open`
- `helper_version`

### `GET /api/template-download`

Query parameter:

- `version`

Allowed current version keys:

- `latest`
- `v1_5_4`
- `v1_5_3`
- `v1_5_2`
- `v1_5_1`
- `v1_5_0`
- `v1_4_0`
- `v1_3_0`
- `v1_2_0`
- `v1_1_0`
- `v1_0_0`

Behavior:

- invalid or unknown version keys must fall back to `latest`
- if the resolved file is missing, return `404` JSON error
- otherwise return the workbook as an attachment with the matching filename

### `POST /api/single`

Request body:

- JSON
- fields:
  - `name`
  - `description`
  - `ingest_mode`
  - `fields`

Success response:

- `200`
- fields:
  - `ok: true`
  - `document`
  - `warnings`
  - `errors: []`

Failure response:

- `400`
- fields:
  - `ok: false`
  - `errors`
  - `warnings`

Malformed-request parity note:

- invalid JSON or invalid `Content-Length` parsing errors return a single `error` string rather than the `errors` array shape

### `POST /api/convert-rows`

Request body:

- JSON
- fields:
  - `rows` array, required
  - `name`
  - `source`
  - `sheet_name`
  - `description`
  - `document_created`

Parity note:

- the endpoint accepts `document_created`, but current conversion logic ignores it and always stamps current UTC time

Success response:

- `200`
- fields:
  - `ok: true`
  - `document`
  - `errors: []`
  - `warnings`
  - `stats`

Failure response:

- `400`
- fields:
  - `ok: false`
  - `document: null`
  - `errors`
  - `warnings`
  - `stats`

Malformed-request parity note:

- invalid JSON or a missing/non-array `rows` field can return a simpler shape with `ok: false` and a single `error` string

### `POST /api/convert-excel`

Request requirements:

- `multipart/form-data`
- uploaded file field name must be `file`

Accepted text fields:

- `name`
- `sheet_name`
- `description`
- `document_created`

Failure cases to preserve:

- wrong content type
- missing file field
- empty upload
- workbook parse failure

Workbook parse failures must return:

- `400`
- `ok: false`
- `error`
- `debug` stack trace text

### `POST /api/quit`

Behavior:

- available only in desktop mode
- when unavailable, return `409` with a JSON error
- when available, return `200 { "ok": true }` and stop the desktop runtime asynchronously

## 6. Data Model And Output Requirements

## 6.1 Top-Level Document Shape

All successful generation paths must return a document shaped like:

```json
{
  "name": "Document name",
  "description": "Optional description",
  "items": [],
  "document_created": "2026-04-04T12:34:56.000+00:00",
  "helper_version": "v1.5.4"
}
```

Rules:

- `description` is omitted when blank
- `items` contains one item for single-title mode and one item per converted row for bulk/direct mode
- `document_created` must be generated server-side from current UTC time
- `helper_version` must come from `program_types.json`
- when `/api/single` is called without a document name or description, the backend may auto-suggest them from item metadata
- batch conversion only returns a document when at least one item was created and zero row errors occurred

## 6.2 Item Shape

Each item must have:

```json
{
  "type": "MOVIE",
  "external_id": "M_avatar_2009",
  "data": {}
}
```

`type` must be the ingest type after normalization.

## 6.3 Supported Program Types

Supported normalized program types:

- `MOVIE`
- `TVSHOW`
- `SEASON`
- `EPISODE`
- `TRAILER`
- `EXTRA`

## 6.4 Program Type Aliases

The converter must normalize these aliases:

- `MOVIE` -> `MOVIE`
- `TVSHOW` -> `TVSHOW`
- `SEASON` -> `SEASON`
- `EPISODE` -> `EPISODE`
- `TRAILER` -> `TRAILER`
- `TRAILERS` -> `TRAILER`
- `EXTRA` -> `EXTRA`
- `EXTRAS` -> `EXTRA`
- `SHOW` -> `TVSHOW`
- `TV SHOW` -> `TVSHOW`
- `SERIES` -> `TVSHOW`
- `TVSERIES` -> `TVSHOW`
- `TVSEASON` -> `SEASON`
- `TVEPISODE` -> `EPISODE`
- `PREVIEW` -> `TRAILER`

Unsupported types must produce an error listing supported values.

## 6.5 Data Payload Construction

The `data` object may contain these fields when present:

- `title`
- `original_title`
- `description`
- `synopsis`
- `released`
- `studio`
- `parent_external_id`
- `index`
- `tags`
- `genres`
- `cast`
- `production_countries`
- `licenses`
- `main_video`
- `images`
- `trailers`
- `localizations`

Structure rules:

- `tags`, `genres`, `cast`, `production_countries` are arrays
- `licenses` is an array containing one object
- `main_video` is an object with `source` and/or `profile`
- `images` is an array of `{ "path": "...", "type": "COVER" | "TEASER" }`
- `trailers` is an array containing one object with `source` and/or `profile`
- `localizations` is an array containing one object with `language_tag` plus localized fields

Type-specific removals:

- `TVSHOW` and `SEASON` must not include `main_video`
- `TRAILER` must not include nested `trailers`

## 6.6 Validation Rules

The converter must enforce:

- required fields by program type
- `index` must be an integer greater than `0`
- `main_video.profile` requires `main_video.source`
- `trailers[].profile` requires `trailers[].source`
- localized fields require `language_tag`
- `parent_type` must be a supported program type when supplied
- `parent_type` must be one of the allowed parent types for the selected program type when constraints exist
- an item with no resulting `data` payload is invalid
- a completely blank batch must fail with no document output

## 6.7 Parent Derivation

If `parent_external_id` is missing:

- for `EPISODE`, derive by stripping trailing `E<number>` from `external_id`
- for `SEASON`, derive by stripping trailing `S<number>` from `external_id`

When derivation succeeds, add warning:

- `Derived parent_external_id from external_id`

## 6.8 Date And Time Normalization

Supported date formats:

- `YYYY-MM-DD`
- `YYYY/MM/DD`
- `MM/DD/YYYY`
- `MM/DD/YY`
- `YYYY`

Supported datetime formats:

- `YYYY-MM-DD hh:mm AM/PM`
- `YYYY-MM-DD HH:MM`
- `YYYY-MM-DDTHH:MM`
- `YYYY/MM/DD hh:mm AM/PM`
- `YYYY/MM/DD HH:MM`
- `MM/DD/YYYY hh:mm AM/PM`
- `MM/DD/YYYY HH:MM`
- `YYYY-MM-DDTHH:MM:SS`
- `YYYY-MM-DDTHH:MM:SS.ssssss`

Normalization rules:

- `released` becomes `YYYY-MM-DD`
- year-only `released` values become `YYYY-01-01`
- `license_start` and `license_end` become `YYYY-MM-DDTHH:MM:SS.000+00:00` when parsed from datetime
- date-only `license_start` becomes `T00:00:00.000+00:00`
- date-only `license_end` becomes `T23:59:59.999+00:00`
- values already ending in `Z` are rewritten to `+00:00`

Important parity note:

- the current implementation normalizes timestamps syntactically but does not perform full timezone offset conversion before formatting

## 6.9 Multi-Value Parsing

The converter must split list-like text on:

- comma
- semicolon
- newline

Uppercasing rules:

- `license_countries` values are uppercased
- `production_countries` values are not forced to uppercase

## 7. Spreadsheet Parsing Requirements

The bulk workbook parser must:

- use standard `.xlsx` zip/XML parsing
- support shared strings
- support inline strings
- return booleans as `TRUE` or `FALSE`
- keep numerics as strings
- read workbook sheet names and sheet targets
- select a user-requested sheet name case-insensitively when supplied
- otherwise use the first sheet
- treat the first non-empty row as the header row
- map subsequent non-empty rows to `header -> value`
- retain original sheet row numbers
- retain per-cell references such as `B7`

## 7.1 Spreadsheet Header Alias Mapping

The converter must map these normalized headers to internal fields:

| Header alias | Internal field |
|---|---|
| `assettype` | `program_type` |
| `programtype` | `program_type` |
| `externalid` | `external_id` |
| `guid` | `external_id` |
| `series` | `series_hint` |
| `id` | `platform_id` |
| `titlealternateid` | `external_id` |
| `title` | `title` |
| `originaltitle` | `original_title` |
| `description` | `description` |
| `synopsis` | `synopsis` |
| `releaseddate` | `released` |
| `pubdate` | `released` |
| `year` | `released` |
| `studio` | `studio` |
| `seasonepnumber` | `index` |
| `seasonnumber` | `season_index` |
| `episodenumber` | `episode_index` |
| `parenttype` | `parent_type` |
| `parentexternalid` | `parent_external_id` |
| `genres` | `genres` |
| `tags` | `tags` |
| `cast` | `cast` |
| `productioncountries` | `production_countries` |
| `countryoforigin` | `production_countries` |
| `licensestartutc` | `license_start` |
| `availabledate` | `license_start` |
| `licenseendutc` | `license_end` |
| `expirationdate` | `license_end` |
| `licensecountries` | `license_countries` |
| `availabilitylabels` | `license_countries` |
| `videosource` | `video_source` |
| `videoprofile` | `video_profile` |
| `coverimage` | `cover_image` |
| `teaserimage` | `teaser_image` |
| `language` | `language_tag` |
| `languagetag` | `language_tag` |
| `localizedtitle` | `localized_title` |
| `localizeddescription` | `localized_description` |
| `localizedsynopsis` | `localized_synopsis` |
| `trailersource` | `trailer_source` |
| `trailerprofile` | `trailer_profile` |

## 7.2 Spreadsheet External-ID Selection

When multiple columns could map to `external_id`, the converter must choose in this priority order:

1. `externalid`
2. `titlealternateid`
3. `guid`
4. `series`
5. `id`

Special case:

- if `guid` wins but is numeric and `series` contains an underscore and alphabetic characters, prefer `series`

## 7.3 Row-Error Formatting

Bulk and direct conversion failures must report row-level errors.

When possible, errors must include a cell reference:

- example: `Error at B7: External ID is required`

When no cell can be resolved, use row wording:

- example: `Error at row 7: Unsupported program type 'FOO'. Supported values: ...`

The converter must map raw validation messages into more user-friendly spreadsheet wording for:

- missing external ID
- missing title
- missing number/index
- missing parent type
- missing parent external ID
- invalid index
- missing language tag for localization
- missing video source when video profile is set
- missing trailer source when trailer profile is set
- invalid parent type choices

## 8. Frontend Runtime Behavior

On page initialization, the app must:

1. resolve and apply theme
2. wrap label text nodes in `.label-text` spans for styling
3. bind all UI event listeners
4. build the direct-sheet table
5. initialize document-created placeholder displays
6. force initial single-title metadata suggestions
7. initialize the output preview with the default empty document
8. attempt to register the service worker
9. start heartbeat polling every 15 seconds
10. start runtime polling every 20 seconds
11. request `/api/runtime`
12. if runtime is reachable, request `/api/config` and `/api/picklists`

Additional runtime behavior:

- on window focus, refresh runtime status
- on document visibility return, send a health heartbeat and refresh runtime status
- on unload, stop heartbeat and polling timers

## 9. Desktop Runtime Requirements

The desktop launcher must:

- bind only to `127.0.0.1`
- default to port `8080`
- use fallback ports `8090` and `8100` before a random ephemeral port
- detect whether `8080` already hosts a running helper and, if so, attach to it instead of starting a second instance
- open the app URL in the user's browser immediately after launch
- expose desktop quit support via `/api/quit`
- track activity timestamps through server callbacks
- stop after idle inactivity
- stop on `SIGINT` or `SIGTERM`

Idle-timeout behavior:

- default `28800` seconds, about 8 hours
- configurable via `AXINOM_HELPER_IDLE_TIMEOUT`
- runtime must expose this timeout through `/api/runtime`

Desktop relaunch behavior:

- the runtime must advertise protocol `axinom-ingest://open`
- the frontend relaunch action must navigate to that protocol URL

## 10. Service Worker Requirements

The app must register a service worker when supported by the browser.

Current offline-shell behavior to preserve:

- cache name is versioned
- cache app shell assets:
  - `/`
  - `/index.html`
  - `/app.js`
  - `/styles.css`
- never cache `/api/*` requests
- for navigations, use network-first with cached `/index.html` fallback
- for shell assets, use network-first with cached asset fallback
- delete prior `axinom-ingest-shell-*` caches on activate

This provides browser-shell refresh resilience, not true offline conversion.

## 11. Packaging And Deployment Requirements

## 11.1 macOS Packaging

The repository must support creating a macOS installer package that:

- packages the desktop launcher into an `.app`
- bundles:
  - static frontend
  - `program_types.json`
  - all supported template files from `v1.0.0` through `v1.5.4`
- installs the app into `/Applications`
- registers custom URL scheme `axinom-ingest`
- uses app icon `release/macos/assets/AxinomIngestHelper.icns`
- emits:
  - `release/macos/dist/AxinomIngestHelper-<version>.pkg`
  - `release/macos/dist/AxinomIngestHelper-<version>-README.txt`

The build process may rely on PyInstaller and Xcode Command Line Tools.

## 11.2 Hosted Web Deployment

The repository must support a hosted deployment model where:

- the server is started with `bash startup.sh`
- `startup.sh` executes `python webapp/server.py`
- no third-party runtime Python packages are required for the hosted helper
- the app can run on Azure App Service using environment-provided host and port values

## 12. Non-Functional Requirements

The current app implicitly requires:

- no database
- no user authentication
- no server-side persistence
- no third-party Python runtime dependencies for the web helper
- fast local startup
- all UI operations performed client-side except conversion/API requests
- a visually polished dark-first interface with a matching light theme
- syntax-highlighted, wrapped JSON that does not force horizontal page overflow

## 13. Explicit Current Limitations And Non-Goals

These are not implemented today and should not be assumed in a parity rebuild:

- no JSON Schema validation against Axinom schema
- no duplicate `external_id` detection across a batch
- no cross-item parent/child integrity validation across a batch
- no persistence of generated jobs or history
- no login, SSO, permissions, or audit trail
- no inline validation highlighting inside the direct-sheet grid
- no direct-sheet row delete or duplicate controls
- no direct-sheet-specific template-version selector
- no editable `document_created` control despite the API accepting that field
- no single-form UI controls for `language_tag`, `localized_title`, `localized_description`, or `localized_synopsis`

Important latent capability note:

- spreadsheet conversion and backend data building do support localization fields, but the single-title UI does not currently expose them

## 14. Rebuild Acceptance Checklist

A replacement implementation meets parity when all of the following are true:

- the page structure, themes, tabs, runtime banner, and output area behave as described
- all three workflows are present and wired to equivalent conversion behavior
- program types, parent-type rules, template versions, and picklists match current values
- generated JSON structure and field normalization match current output conventions
- document name auto-suggestion and 50-character limit match current behavior
- desktop mode, runtime health checks, idle timeout, and relaunch protocol behave equivalently
- macOS packaging still produces a distributable desktop installer
- hosted web deployment still runs with `startup.sh` and no third-party runtime dependencies
- current omissions remain omitted unless intentionally approved as product changes
