const state = {
  requiredFields: {},
  programTypes: ["MOVIE", "TVSHOW", "SEASON", "EPISODE"],
  currentJson: '{\n  "name": "Axinom Ingest",\n  "items": []\n}',
};

const singleFieldIds = [
  "program_type",
  "external_id",
  "title",
  "original_title",
  "description",
  "synopsis",
  "released",
  "studio",
  "index",
  "parent_external_id",
  "genres",
  "tags",
  "cast",
  "production_countries",
  "license_start",
  "license_end",
  "license_countries",
  "video_source",
  "video_profile",
  "trailer_source",
  "trailer_profile",
  "cover_image",
  "teaser_image",
  "language_tag",
  "localized_title",
  "localized_description",
  "localized_synopsis",
];

const FIELD_VISIBILITY = {
  MOVIE: new Set([
    "title",
    "original_title",
    "description",
    "synopsis",
    "released",
    "studio",
    "genres",
    "tags",
    "cast",
    "production_countries",
    "license_start",
    "license_end",
    "license_countries",
    "video_source",
    "video_profile",
    "trailer_source",
    "trailer_profile",
    "cover_image",
    "teaser_image",
    "language_tag",
    "localized_title",
    "localized_description",
    "localized_synopsis",
  ]),
  TVSHOW: new Set([
    "title",
    "original_title",
    "description",
    "synopsis",
    "released",
    "studio",
    "genres",
    "tags",
    "cast",
    "production_countries",
    "license_start",
    "license_end",
    "license_countries",
    "trailer_source",
    "trailer_profile",
    "cover_image",
    "teaser_image",
    "language_tag",
    "localized_title",
    "localized_description",
    "localized_synopsis",
  ]),
  SEASON: new Set([
    "description",
    "synopsis",
    "released",
    "studio",
    "index",
    "parent_external_id",
    "genres",
    "tags",
    "cast",
    "production_countries",
    "license_start",
    "license_end",
    "license_countries",
    "trailer_source",
    "trailer_profile",
    "cover_image",
    "teaser_image",
    "language_tag",
    "localized_title",
    "localized_description",
    "localized_synopsis",
  ]),
  EPISODE: new Set([
    "title",
    "original_title",
    "description",
    "synopsis",
    "released",
    "studio",
    "index",
    "parent_external_id",
    "genres",
    "tags",
    "cast",
    "production_countries",
    "license_start",
    "license_end",
    "license_countries",
    "video_source",
    "video_profile",
    "trailer_source",
    "trailer_profile",
    "cover_image",
    "teaser_image",
    "language_tag",
    "localized_title",
    "localized_description",
    "localized_synopsis",
  ]),
};

const DIRECT_COLUMNS = [
  "Asset Type",
  "External ID",
  "Title",
  "Original Title",
  "Description",
  "Synopsis",
  "Released Date",
  "Studio",
  "Season/Ep Number",
  "Parent External ID",
  "Genres",
  "Tags",
  "Cast",
  "Production Countries",
  "License Start (UTC)",
  "License End (UTC)",
  "License Countries",
  "Video Source",
  "Video Profile",
  "Cover Image",
  "Teaser Image",
  "Language Tag",
  "Localized Title",
  "Localized Description",
  "Localized Synopsis",
  "Trailer Source",
  "Trailer Profile",
];

function byId(id) {
  return document.getElementById(id);
}

function setStatus(message, kind = "") {
  const status = byId("status");
  status.textContent = message;
  status.className = "status" + (kind ? ` ${kind}` : "");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function syntaxHighlightJson(jsonString) {
  const escaped = escapeHtml(jsonString);
  return escaped.replace(
    /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)/g,
    (token) => {
      let cls = "json-number";
      if (token.startsWith("\"")) {
        cls = token.endsWith(":") || token.includes("\":") ? "json-key" : "json-string";
      } else if (token === "true" || token === "false") {
        cls = "json-boolean";
      } else if (token === "null") {
        cls = "json-null";
      }
      return `<span class="${cls}">${token}</span>`;
    },
  );
}

function renderJson(value) {
  state.currentJson = value;
  byId("json-output").innerHTML = syntaxHighlightJson(value);
}

function formatErrors(result) {
  if (Array.isArray(result.errors)) {
    if (result.errors.length && typeof result.errors[0] === "object") {
      return result.errors
        .map((entry) => {
          const row = entry.row ? `Row ${entry.row}` : "File";
          const details = Array.isArray(entry.errors)
            ? entry.errors.join(", ")
            : String(entry.errors || "Unknown error");
          return `${row}: ${details}`;
        })
        .join(" | ");
    }
    return result.errors.join(" | ");
  }
  return result.error || "Request failed";
}

function activateTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tabTarget === tabId);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    const isActive = panel.id === tabId;
    panel.classList.toggle("is-active", isActive);
    panel.setAttribute("aria-hidden", isActive ? "false" : "true");
  });
}

function ensureLabelTextSpans() {
  document.querySelectorAll("label").forEach((label) => {
    if (label.querySelector(":scope > .label-text")) {
      return;
    }

    const textNode = [...label.childNodes].find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0,
    );
    if (!textNode) {
      return;
    }

    const span = document.createElement("span");
    span.className = "label-text";
    span.textContent = textNode.textContent.trim();
    label.insertBefore(span, textNode);
    textNode.textContent = "";
  });
}

function updateRequiredHint() {
  const programType = byId("field-program_type").value;
  const required = state.requiredFields[programType] || [];
  const requiredBox = byId("required-fields");
  requiredBox.textContent = required.length
    ? `Required for ${programType}: ${required.join(", ")}`
    : `No required field metadata found for ${programType}.`;

  updateRequiredFieldStyles();
}

function updateRequiredFieldStyles() {
  const programType = byId("field-program_type").value;
  const required = new Set([...(state.requiredFields[programType] || []), "program_type"]);

  document.querySelectorAll("#tab-single label[data-field]").forEach((label) => {
    const field = label.dataset.field;
    label.classList.toggle("is-required", required.has(field));
  });
}

function updateVisibleFields() {
  const programType = byId("field-program_type").value;
  const visible = FIELD_VISIBILITY[programType] || FIELD_VISIBILITY.MOVIE;

  document.querySelectorAll("#single-fields-grid [data-field]").forEach((el) => {
    const field = el.dataset.field;
    const shouldShow = visible.has(field);
    el.classList.toggle("hidden-field", !shouldShow);
  });

  updateRequiredFieldStyles();
}

function collectSinglePayload() {
  const fields = {};
  for (const fieldId of singleFieldIds) {
    const el = byId(`field-${fieldId}`);
    fields[fieldId] = el ? el.value : "";
  }

  return {
    name: byId("single-name").value,
    description: byId("single-description").value,
    document_created: byId("single-document_created").value,
    fields,
  };
}

async function generateSingle() {
  setStatus("Generating JSON for single item...");

  const response = await fetch("/api/single", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(collectSinglePayload()),
  });

  const result = await response.json();

  if (result.document) {
    renderJson(JSON.stringify(result.document, null, 2));
  }

  if (!response.ok || !result.ok) {
    setStatus(formatErrors(result), "error");
    return;
  }

  if (Array.isArray(result.warnings) && result.warnings.length) {
    setStatus(`Generated with warning(s): ${result.warnings.join(" | ")}`, "warn");
    return;
  }

  setStatus("Single item JSON generated.", "ok");
}

async function convertBulk() {
  const fileInput = byId("bulk-file");
  if (!fileInput.files || !fileInput.files[0]) {
    setStatus("Choose a .xlsx file first.", "error");
    return;
  }

  setStatus("Converting workbook to ingest JSON...");

  const form = new FormData();
  form.append("file", fileInput.files[0]);
  form.append("name", byId("bulk-name").value || "Axinom Bulk Ingest");
  form.append("description", byId("bulk-description").value || "");
  form.append("document_created", byId("bulk-document_created").value || "");

  const sheetName = byId("bulk-sheet").value.trim();
  if (sheetName) {
    form.append("sheet_name", sheetName);
  }

  const response = await fetch("/api/convert-excel", {
    method: "POST",
    body: form,
  });

  const result = await response.json();

  if (result.document) {
    renderJson(JSON.stringify(result.document, null, 2));
  }

  if (!response.ok || !result.ok) {
    setStatus(formatErrors(result), "error");
    return;
  }

  const stats = result.stats || {};
  const summary = `Converted ${stats.items_created || 0} item(s) from ${stats.rows_read || 0} row(s) on sheet '${stats.sheet || ""}'.`;

  if (Array.isArray(result.warnings) && result.warnings.length) {
    setStatus(`${summary} Warning(s): ${result.warnings.join(" | ")}`, "warn");
    return;
  }

  setStatus(summary, "ok");
}

function directInputConfig(columnName) {
  if (columnName === "Asset Type") {
    return { kind: "select" };
  }

  if (columnName === "Released Date") {
    return { kind: "input", type: "date" };
  }

  if (columnName === "License Start (UTC)" || columnName === "License End (UTC)") {
    return { kind: "input", type: "datetime-local" };
  }

  if (columnName === "Season/Ep Number") {
    return { kind: "input", type: "number" };
  }

  if (["Production Countries", "License Countries"].includes(columnName)) {
    return { kind: "input", type: "text", list: "country-code-list" };
  }

  if (["Video Profile", "Trailer Profile"].includes(columnName)) {
    return { kind: "input", type: "text", list: "video-profile-list" };
  }

  if (columnName === "Language Tag") {
    return { kind: "input", type: "text", list: "language-tag-list" };
  }

  return { kind: "input", type: "text" };
}

function createCellInput(columnName, initialValue = "") {
  const config = directInputConfig(columnName);

  if (config.kind === "select") {
    const select = document.createElement("select");
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "";
    select.appendChild(blank);

    state.programTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      select.appendChild(option);
    });

    select.value = initialValue || "";
    return select;
  }

  const input = document.createElement("input");
  input.type = config.type;
  input.value = initialValue || "";

  if (config.type === "number") {
    input.min = "1";
  }

  if (config.list) {
    input.setAttribute("list", config.list);
  }

  return input;
}

function refreshDirectProgramTypeOptions() {
  const selects = byId("direct-table").querySelectorAll("tbody tr td select");
  selects.forEach((select) => {
    const currentValue = select.value;
    select.innerHTML = "";

    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "";
    select.appendChild(blank);

    state.programTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      select.appendChild(option);
    });

    if (state.programTypes.includes(currentValue)) {
      select.value = currentValue;
    }
  });
}

function updateDirectRowNumbers() {
  const rows = byId("direct-table").querySelectorAll("tbody tr");
  rows.forEach((row, idx) => {
    const marker = row.querySelector(".row-marker");
    if (marker) {
      marker.textContent = String(idx + 1);
    }
  });
}

function appendDirectRow(initialValues = {}) {
  const table = byId("direct-table");
  const tbody = table.querySelector("tbody");
  const row = document.createElement("tr");

  const markerCell = document.createElement("td");
  markerCell.className = "row-marker";
  markerCell.textContent = "";
  row.appendChild(markerCell);

  DIRECT_COLUMNS.forEach((column) => {
    const cell = document.createElement("td");
    const input = createCellInput(column, initialValues[column] || "");
    cell.appendChild(input);
    row.appendChild(cell);
  });

  tbody.appendChild(row);
  updateDirectRowNumbers();
}

function buildDirectTable() {
  const table = byId("direct-table");
  table.innerHTML = "";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  const rowHead = document.createElement("th");
  rowHead.textContent = "#";
  headRow.appendChild(rowHead);

  DIRECT_COLUMNS.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column;
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  for (let i = 0; i < 6; i += 1) {
    appendDirectRow();
  }
}

function readDirectRows() {
  const table = byId("direct-table");
  const rows = table.querySelectorAll("tbody tr");
  const result = [];

  rows.forEach((row) => {
    const values = {};
    const cells = row.querySelectorAll("td");

    DIRECT_COLUMNS.forEach((column, idx) => {
      const input = cells[idx + 1]?.querySelector("input, select");
      values[column] = input ? input.value.trim() : "";
    });

    const hasData = Object.values(values).some((value) => value !== "");
    if (hasData) {
      result.push(values);
    }
  });

  return result;
}

function clearDirectRows() {
  buildDirectTable();
}

async function convertDirectRows() {
  const rows = readDirectRows();
  if (!rows.length) {
    setStatus("Enter at least one row in the direct sheet.", "error");
    return;
  }

  setStatus("Converting direct sheet rows to ingest JSON...");

  const response = await fetch("/api/convert-rows", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: byId("direct-name").value || "Axinom Direct Sheet Ingest",
      description: byId("direct-description").value || "",
      document_created: byId("direct-document_created").value || "",
      source: "direct-sheet",
      sheet_name: "Direct Entry",
      rows,
    }),
  });

  const result = await response.json();

  if (result.document) {
    renderJson(JSON.stringify(result.document, null, 2));
  }

  if (!response.ok || !result.ok) {
    setStatus(formatErrors(result), "error");
    return;
  }

  const stats = result.stats || {};
  const summary = `Converted ${stats.items_created || 0} direct row item(s) from ${stats.rows_read || 0} row(s).`;

  if (Array.isArray(result.warnings) && result.warnings.length) {
    setStatus(`${summary} Warning(s): ${result.warnings.join(" | ")}`, "warn");
    return;
  }

  setStatus(summary, "ok");
}

function downloadTemplate(version) {
  const safeVersion = version || "latest";
  window.location.href = `/api/template-download?version=${encodeURIComponent(safeVersion)}`;
}

function clearSingle() {
  byId("single-description").value = "";
  byId("single-document_created").value = "";

  for (const fieldId of singleFieldIds) {
    const el = byId(`field-${fieldId}`);
    if (!el) {
      continue;
    }

    if (fieldId === "program_type") {
      el.value = "MOVIE";
    } else {
      el.value = "";
    }
  }

  updateRequiredHint();
  updateVisibleFields();
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(state.currentJson);
    setStatus("JSON copied to clipboard.", "ok");
  } catch (error) {
    setStatus("Clipboard copy failed. You can manually copy from output.", "error");
  }
}

function downloadOutput() {
  const blob = new Blob([state.currentJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "axinom-ingest.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderDataList(listId, values) {
  const list = byId(listId);
  if (!list || !Array.isArray(values) || !values.length) {
    return;
  }

  list.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    list.appendChild(option);
  });
}

async function fetchConfig() {
  const configResponse = await fetch("/api/config");
  const configPayload = await configResponse.json();
  state.requiredFields = configPayload.required_fields || {};
  state.programTypes = configPayload.program_types || state.programTypes;

  const picklistResponse = await fetch("/api/picklists");
  const picklistPayload = await picklistResponse.json();

  renderDataList("video-profile-list", picklistPayload.video_profiles || []);
  renderDataList("country-code-list", picklistPayload.common_country_codes || []);
  renderDataList("language-tag-list", picklistPayload.common_language_tags || []);
  refreshDirectProgramTypeOptions();

  updateRequiredHint();
  updateVisibleFields();
}

function bindEvents() {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tabTarget));
  });

  byId("field-program_type").addEventListener("change", () => {
    updateRequiredHint();
    updateVisibleFields();
  });

  byId("build-single").addEventListener("click", generateSingle);
  byId("clear-single").addEventListener("click", clearSingle);

  byId("convert-bulk").addEventListener("click", convertBulk);
  byId("download-template-bulk").addEventListener("click", () => {
    downloadTemplate(byId("bulk-template-version").value);
  });

  byId("add-direct-row").addEventListener("click", () => appendDirectRow());
  byId("clear-direct-rows").addEventListener("click", clearDirectRows);
  byId("convert-direct").addEventListener("click", convertDirectRows);
  byId("download-template-direct").addEventListener("click", () => {
    downloadTemplate(byId("bulk-template-version").value || "latest");
  });

  byId("copy-json").addEventListener("click", copyOutput);
  byId("download-json").addEventListener("click", downloadOutput);
}

async function init() {
  ensureLabelTextSpans();
  bindEvents();
  buildDirectTable();
  await fetchConfig();
  renderJson(state.currentJson);
}

init().catch((error) => {
  setStatus(`Initialization failed: ${error.message}`, "error");
});
