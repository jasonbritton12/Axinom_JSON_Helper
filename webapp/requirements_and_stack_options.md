# Axinom Ingest Helper: Expanded Requirements And Stack Options

## 1) Functional Requirements (v1)

- Create one ingest item from UI form and output valid ingest JSON.
- Convert bulk Excel template (`.xlsx`) to a single ingest JSON document.
- Support input program types: `MOVIE`, `TVSHOW`, `SEASON`, `EPISODE`.
- Enforce minimum required fields per type.
- Show row-level errors for bulk conversion.
- Support optional metadata fields without forcing entry.
- Allow JSON download/copy.

## 2) Data/Validation Requirements

- Config-driven type rules in `program_types.json`.
- Header alias mapping for multiple spreadsheet formats.
- Basic normalization:
  - dates to `YYYY-MM-DD`
  - license timestamps to ISO UTC string
  - comma-separated lists to arrays
- Relationship checks:
  - `SEASON.parent_external_id`
  - `EPISODE.parent_external_id`
  - derive parent ID from item external ID when possible

## 3) Non-Functional Requirements

- No paid dependencies for local run.
- Role-based access when deployed (SSO preferred).
- Auditability (who generated/updated JSON and when).
- Versioned metadata schema and rollout safety.

## 4) Suggested Roadmap

## Phase 1 (Done in prototype)

- Standalone local web app.
- Single + bulk conversion.
- Extensible type config.

## Phase 2

- Add JSON schema validation against your canonical schema.
- Add metadata profile presets (per distributor/outlet).
- Add relationship checks across full document (e.g., TVSHOW exists before SEASON/EPISODE).
- Add import/export presets and mapping templates.

## Phase 3

- SSO + hosted deployment.
- Submission pipeline (save JSON to storage, optional ingest trigger).
- Approval workflow and audit logs.

## 5) Stack Options

## Option A: Python Web App (Fastest path, lowest complexity)

- Frontend: HTML/CSS/JS
- Backend: Python (`FastAPI`/`Flask` or stdlib)
- Host: Azure App Service or internal VM
- Auth: Microsoft Entra ID
- Storage: SharePoint/Blob (optional)

Pros:
- Fast to implement and evolve.
- Easy schema/version control in Git.
- Low operating cost.

Tradeoffs:
- Needs light engineering ownership.

## Option B: Power Apps + Power Automate (MS365-native)

- UI in Power Apps.
- Excel/SharePoint as source.
- Flow transforms to JSON and stores/sends.

Pros:
- Fits existing MS365 governance.
- Lower code footprint.

Tradeoffs:
- Complex JSON transformations and schema drift become harder to maintain.
- Debugging/versioning is weaker than code-first.

## Option C: Hybrid (Recommended medium-term)

- Keep conversion logic in Python service.
- Expose as API.
- Use Power Apps or CMS-linked UI as shell.

Pros:
- Good balance: maintainable transform engine + familiar business UI.

Tradeoffs:
- Slightly more architecture/setup.

## 6) Axinom Module Consideration

If your Mosaic tenant supports embedding a custom internal tool (for example via extension points or iframe integration), this app can be embedded as a module shell around the same API.

If not, keep it standalone and link from Axinom operational docs/runbooks. The conversion logic remains reusable either way.
