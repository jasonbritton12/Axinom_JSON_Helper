const APP_RELEASE_LABEL = "v2.0.2";
const HELPER_VERSION = "v2.0.2";
const DOCUMENT_NAME_MAX_LENGTH = 50;
const THEME_STORAGE_KEY = "axinom_ingest_theme";

const PROGRAM_TYPES = ["MOVIE", "TVSHOW", "SEASON", "EPISODE", "TRAILER", "EXTRA"];
const VIDEO_PROFILES = [
  "CMAF_File_Non-DRM",
  "CMAF_File_DRM",
  "CMAF_File_Non-DRM_SD",
  "CMAF_File_DRM_SD",
];
const COMMON_COUNTRY_CODES = ["US", "CA"];
const TEMPLATE_FILES = {
  latest: "docs/reference/axinom_ingest_template_v2_0_2.xlsx",
  current: "docs/reference/axinom_ingest_template_v2_0_2.xlsx",
};

const PROGRAM_TYPE_CONFIG = {
  MOVIE: { ingestType: "MOVIE", required: ["external_id", "title"], allowedParentTypes: [] },
  TVSHOW: { ingestType: "TVSHOW", required: ["external_id", "title"], allowedParentTypes: [] },
  SEASON: { ingestType: "SEASON", required: ["external_id", "index", "parent_external_id"], allowedParentTypes: ["TVSHOW"] },
  EPISODE: { ingestType: "EPISODE", required: ["external_id", "title", "index", "parent_external_id"], allowedParentTypes: ["SEASON"] },
  TRAILER: { ingestType: "TRAILER", required: ["external_id", "title", "parent_type", "parent_external_id"], allowedParentTypes: ["MOVIE", "TVSHOW", "SEASON", "EPISODE", "EXTRA"] },
  EXTRA: { ingestType: "EXTRA", required: ["external_id", "title", "parent_type", "parent_external_id"], allowedParentTypes: ["MOVIE", "TVSHOW"] },
};

const TYPE_ALIASES = {
  MOVIE: "MOVIE",
  TVSHOW: "TVSHOW",
  SEASON: "SEASON",
  EPISODE: "EPISODE",
  TRAILER: "TRAILER",
  TRAILERS: "TRAILER",
  EXTRA: "EXTRA",
  EXTRAS: "EXTRA",
  SHOW: "TVSHOW",
  "TV SHOW": "TVSHOW",
  SERIES: "TVSHOW",
  TVSERIES: "TVSHOW",
  TVSEASON: "SEASON",
  TVEPISODE: "EPISODE",
  PREVIEW: "TRAILER",
};

const FULL_FIELD_VISIBILITY = {
  MOVIE: new Set(["title", "original_title", "description", "synopsis", "released", "studio", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "video_source", "video_profile", "cover_image", "teaser_image"]),
  TVSHOW: new Set(["title", "original_title", "description", "synopsis", "released", "studio", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "cover_image", "teaser_image"]),
  SEASON: new Set(["description", "synopsis", "released", "studio", "index", "parent_external_id", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "cover_image", "teaser_image"]),
  EPISODE: new Set(["title", "original_title", "description", "synopsis", "released", "studio", "index", "parent_external_id", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "video_source", "video_profile", "cover_image", "teaser_image"]),
  TRAILER: new Set(["title", "original_title", "description", "synopsis", "released", "studio", "parent_type", "parent_external_id", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "video_source", "video_profile", "cover_image", "teaser_image"]),
  EXTRA: new Set(["title", "original_title", "description", "synopsis", "released", "studio", "parent_type", "parent_external_id", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "video_source", "video_profile", "cover_image", "teaser_image"]),
};

const SIMPLE_FIELD_VISIBILITY = {
  MOVIE: new Set(["title", "video_source", "video_profile"]),
  TVSHOW: new Set(["title"]),
  SEASON: new Set(["index", "parent_external_id"]),
  EPISODE: new Set(["title", "index", "parent_external_id", "video_source", "video_profile"]),
  TRAILER: new Set(["title", "parent_type", "parent_external_id", "video_source", "video_profile"]),
  EXTRA: new Set(["title", "parent_type", "parent_external_id", "video_source", "video_profile"]),
};

const SIMPLE_VIDEO_REQUIRED_TYPES = new Set(["MOVIE", "EPISODE", "TRAILER", "EXTRA"]);

const HEADER_TO_FIELD = {
  assettype: "program_type",
  programtype: "program_type",
  externalid: "external_id",
  guid: "external_id",
  series: "series_hint",
  id: "platform_id",
  titlealternateid: "external_id",
  title: "title",
  originaltitle: "original_title",
  description: "description",
  synopsis: "synopsis",
  releaseddate: "released",
  pubdate: "released",
  year: "released",
  studio: "studio",
  seasonepnumber: "index",
  seasonepisodeindex: "index",
  seasonnumber: "season_index",
  episodenumber: "episode_index",
  parenttype: "parent_type",
  parentexternalid: "parent_external_id",
  genres: "genres",
  tags: "tags",
  cast: "cast",
  productioncountries: "production_countries",
  countryoforigin: "production_countries",
  licensestartutc: "license_start",
  availabledate: "license_start",
  licenseendutc: "license_end",
  expirationdate: "license_end",
  licensecountries: "license_countries",
  availabilitylabels: "license_countries",
  videosource: "video_source",
  videoprofile: "video_profile",
  coverimage: "cover_image",
  teaserimage: "teaser_image",
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
  "Parent Type",
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
];

const SINGLE_FIELD_IDS = [
  "program_type",
  "external_id",
  "title",
  "original_title",
  "description",
  "synopsis",
  "released",
  "studio",
  "index",
  "parent_type",
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
  "cover_image",
  "teaser_image",
];

const state = {
  currentDocument: null,
  currentJson: '{\n  "name": "Axinom Ingest",\n  "items": []\n}',
  currentDownloadName: "axinom-ingest",
  theme: "dark",
  singleNameDirty: false,
  singleDescriptionDirty: false,
  bulkNameDirty: false,
  bulkDescriptionDirty: false,
  directNameDirty: false,
  directDescriptionDirty: false,
  autoSyncingDocumentMetadata: false,
  bulkPreviewRequestId: 0,
};

function byId(id) {
  return document.getElementById(id);
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : String(value || "").trim();
}

function sanitizeFilenameStem(value) {
  const sanitized = normalizeString(value)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[-_.]+|[-_.]+$/g, "");
  return sanitized || "axinom-ingest";
}

function setCurrentDownloadName(value) {
  state.currentDownloadName = sanitizeFilenameStem(value);
}

function resolveInitialTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  } catch (_error) {
    return "dark";
  }
}

function applyTheme(theme) {
  state.theme = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", state.theme);
  const toggle = byId("theme-toggle");
  if (toggle) {
    toggle.textContent = state.theme === "dark" ? "Use Light Theme" : "Use Dark Theme";
  }
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
  } catch (_error) {
    // Ignore localStorage failures.
  }
}

function toggleTheme() {
  applyTheme(state.theme === "dark" ? "light" : "dark");
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

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function syntaxHighlightJson(jsonString) {
  return escapeHtml(jsonString).replace(
    /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)/g,
    (token) => {
      let cls = "json-number";
      if (token.startsWith('"')) {
        cls = token.endsWith(":") || token.includes('\":') ? "json-key" : "json-string";
      } else if (token === "true" || token === "false") {
        cls = "json-boolean";
      } else if (token === "null") {
        cls = "json-null";
      }
      return `<span class="${cls}">${token}</span>`;
    },
  );
}

function renderDocument(document) {
  state.currentDocument = document && typeof document === "object" ? document : null;
  state.currentJson = state.currentDocument
    ? JSON.stringify(state.currentDocument, null, 2)
    : '{\n  "name": "Axinom Ingest",\n  "items": []\n}';

  const output = byId("json-output");
  if (output) {
    output.innerHTML = syntaxHighlightJson(state.currentJson);
  }

  const ready = Boolean(state.currentDocument);
  byId("download-json").disabled = !ready;
  byId("copy-json").disabled = !ready;
}

function setStatus(message, kind = "") {
  const status = byId("status");
  status.textContent = message;
  status.className = `status${kind ? ` ${kind}` : ""}`;
}

function updateDocumentMetaDisplay(prefix, createdValue = "") {
  const field = byId(`${prefix}-document-created-display`);
  if (field) {
    field.value = createdValue || "Auto-stamped when JSON is generated";
  }
}

function updateAllDocumentMetaDisplays(document = null) {
  const createdValue = normalizeString(document?.document_created);
  ["single", "bulk", "direct"].forEach((prefix) => updateDocumentMetaDisplay(prefix, createdValue));
}

function padTwoDigits(value) {
  return String(value).padStart(2, "0");
}

function getLocalIsoString() {
  const date = new Date();
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  return `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}T${padTwoDigits(date.getHours())}:${padTwoDigits(date.getMinutes())}:${padTwoDigits(date.getSeconds())}.${String(date.getMilliseconds()).padStart(3, "0")}${sign}${padTwoDigits(Math.floor(Math.abs(offsetMinutes) / 60))}:${padTwoDigits(Math.abs(offsetMinutes) % 60)}`;
}

function currentDocumentCreated() {
  return getLocalIsoString();
}

function withDefaultDateTimeLocalTime(value, hours, minutes) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return "";
  }

  const datePart = normalized.split("T")[0];
  return `${datePart}T${padTwoDigits(hours)}:${padTwoDigits(minutes)}`;
}

function bindDefaultDateTimeLocalTime(input, hours, minutes) {
  if (!input) {
    return;
  }

  let hadValueOnFocus = false;
  input.addEventListener("focus", () => {
    hadValueOnFocus = Boolean(normalizeString(input.value));
  });
  input.addEventListener("change", () => {
    if (!hadValueOnFocus && normalizeString(input.value)) {
      input.value = withDefaultDateTimeLocalTime(input.value, hours, minutes);
    }
  });
}

function normalizeProgramType(value) {
  const raw = normalizeString(value).toUpperCase();
  if (PROGRAM_TYPE_CONFIG[raw]) {
    return raw;
  }
  return TYPE_ALIASES[raw] || raw;
}

function currentSingleIngestMode() {
  return (byId("single-ingest-mode")?.value || "SIMPLE").toUpperCase();
}

function allowedParentTypesFor(programType) {
  return PROGRAM_TYPE_CONFIG[programType]?.allowedParentTypes || [];
}

function requiredFieldsForSingle(programType, ingestMode) {
  const required = new Set([...(PROGRAM_TYPE_CONFIG[programType]?.required || []), "program_type"]);
  if (ingestMode === "SIMPLE" && SIMPLE_VIDEO_REQUIRED_TYPES.has(programType)) {
    required.add("video_source");
    required.add("video_profile");
  }
  return required;
}

function currentVisibleSingleFields() {
  const programType = byId("field-program_type").value;
  const ingestMode = currentSingleIngestMode();
  return ingestMode === "FULL"
    ? FULL_FIELD_VISIBILITY[programType] || FULL_FIELD_VISIBILITY.MOVIE
    : SIMPLE_FIELD_VISIBILITY[programType] || SIMPLE_FIELD_VISIBILITY.MOVIE;
}

function populateSingleSelect(select, values, currentValue = "") {
  if (!select) {
    return;
  }

  const safeCurrent = normalizeString(currentValue || select.value);
  select.innerHTML = "";

  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "";
  select.appendChild(blank);

  (values || []).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  if ([...select.options].some((option) => option.value === safeCurrent)) {
    select.value = safeCurrent;
  } else {
    select.value = "";
  }
}

function renderSelectOptions(selectId, values) {
  const select = byId(selectId);
  if (!select) {
    return;
  }

  const current = new Set([...select.selectedOptions].map((option) => normalizeString(option.value)).filter(Boolean));
  select.innerHTML = "";
  (values || []).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (current.has(value)) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

function renderDataList(listId, values) {
  const list = byId(listId);
  if (!list) {
    return;
  }
  list.innerHTML = "";
  (values || []).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    list.appendChild(option);
  });
}

function singleFieldLabel(fieldId) {
  const labelNode = document.querySelector(`#tab-single label[data-field="${fieldId}"] .label-text`);
  return labelNode ? labelNode.textContent.trim().replace(/\s+\*$/, "") : fieldId;
}

function updateIndexFieldLabel(programType) {
  const labelNode = document.querySelector('#tab-single label[data-field="index"] .label-text');
  if (!labelNode) {
    return;
  }

  if (programType === "SEASON") {
    labelNode.textContent = "Season Index (Season Number)";
    return;
  }

  if (programType === "EPISODE") {
    labelNode.textContent = "Episode Index (Episode Number)";
    return;
  }

  labelNode.textContent = "Index";
}

function updateSingleParentTypeOptions() {
  const programType = byId("field-program_type").value;
  populateSingleSelect(byId("field-parent_type"), allowedParentTypesFor(programType));
}

function updateRequiredFieldStyles() {
  const required = requiredFieldsForSingle(byId("field-program_type").value, currentSingleIngestMode());
  document.querySelectorAll("#tab-single label[data-field]").forEach((label) => {
    const field = label.dataset.field;
    label.classList.toggle("is-required", required.has(field));
  });
}

function updateRequiredHint() {
  const programType = byId("field-program_type").value;
  updateIndexFieldLabel(programType);
  const required = [...requiredFieldsForSingle(programType, currentSingleIngestMode())].filter((field) => field !== "program_type");
  byId("required-fields").textContent = required.length
    ? `Required for ${programType} (${currentSingleIngestMode() === "FULL" ? "Full" : "Simple"}): ${required.map((field) => singleFieldLabel(field)).join(", ")}`
    : `No required field metadata found for ${programType}.`;
  updateRequiredFieldStyles();
}

function updateVisibleFields() {
  const visible = currentVisibleSingleFields();
  const programType = byId("field-program_type").value;
  updateIndexFieldLabel(programType);
  updateSingleParentTypeOptions();
  document.querySelectorAll("#single-fields-grid [data-field]").forEach((node) => {
    node.classList.toggle("hidden-field", !visible.has(node.dataset.field));
  });
  updateRequiredFieldStyles();
}

function readInputValue(node) {
  if (!node) {
    return "";
  }
  if (node instanceof HTMLSelectElement && node.multiple) {
    return [...node.selectedOptions].map((option) => option.value.trim()).filter(Boolean).join(", ");
  }
  return typeof node.value === "string" ? node.value.trim() : "";
}

function humanizeIdentifier(value) {
  let text = normalizeString(value);
  if (!text) {
    return "";
  }

  text = text.replace(/^[A-Z]_/, "");
  text = text.replace(/([_-])E\d+$/i, "");
  text = text.replace(/([_-])S\d+(?:[_-]E\d+)?$/i, "");

  const tokens = text.split(/[_-]+/).filter(Boolean);
  return tokens.map((token) => {
    if (/^\d+$/.test(token)) {
      return token;
    }
    if (token === token.toUpperCase() && token.length <= 4) {
      return token;
    }
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
  }).join(" ");
}

function stripSeasonSuffix(value) {
  return normalizeString(value).replace(/([_-])S\d+(?:[_-]E\d+)?$/i, "");
}

function extractSeasonIndex(value) {
  const text = normalizeString(value);
  if (!text) {
    return "";
  }

  const matches = [...text.matchAll(/(?:^|[_-])S(\d+)(?=$|[_-])/gi)];
  if (matches.length) {
    return padTwoDigits(matches[matches.length - 1][1]);
  }

  const fallback = text.match(/season\D*(\d+)/i);
  return fallback ? padTwoDigits(fallback[1]) : "";
}

function padIndexLabel(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return "";
  }
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? padTwoDigits(parsed) : normalized;
}

function truncateWithEllipsis(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }
  if (maxLength <= 3) {
    return value.slice(0, maxLength);
  }
  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function buildDocumentName(subject, suffix) {
  const cleanSubject = normalizeString(subject) || "Axinom";
  const cleanSuffix = normalizeString(suffix) || "Ingest";
  const reserved = ` - ${cleanSuffix}`;
  if (reserved.length >= DOCUMENT_NAME_MAX_LENGTH) {
    return truncateWithEllipsis(`${cleanSubject}${reserved}`, DOCUMENT_NAME_MAX_LENGTH);
  }
  return `${truncateWithEllipsis(cleanSubject, DOCUMENT_NAME_MAX_LENGTH - reserved.length)}${reserved}`;
}

function documentSubjectFromFields(fields) {
  const programType = normalizeProgramType(fields.program_type);
  const title = normalizeString(fields.title);
  const externalId = normalizeString(fields.external_id);
  const parentExternalId = normalizeString(fields.parent_external_id);

  if (programType === "MOVIE") {
    return title || humanizeIdentifier(externalId) || "Movie";
  }
  if (programType === "TVSHOW") {
    return title || humanizeIdentifier(externalId) || "TV Show";
  }
  if (programType === "SEASON") {
    return humanizeIdentifier(parentExternalId) || title || humanizeIdentifier(externalId) || "TV Show";
  }
  if (programType === "EPISODE") {
    return humanizeIdentifier(stripSeasonSuffix(parentExternalId) || parentExternalId) || title || humanizeIdentifier(externalId) || "TV Show";
  }
  if (programType === "TRAILER" || programType === "EXTRA") {
    return title || humanizeIdentifier(parentExternalId) || humanizeIdentifier(externalId) || programType;
  }
  return title || humanizeIdentifier(externalId) || "Axinom Ingest";
}

function suggestDocumentMetadataForFields(fields) {
  const programType = normalizeProgramType(fields.program_type);
  const subject = documentSubjectFromFields(fields);
  const index = padIndexLabel(fields.index);
  const seasonIndex = extractSeasonIndex(fields.parent_external_id);

  if (programType === "MOVIE") {
    return { name: buildDocumentName(subject, "Movie Ingest"), description: `Single-item movie ingest for ${subject}.` };
  }
  if (programType === "TVSHOW") {
    return { name: buildDocumentName(subject, "TV Show Ingest"), description: `Single-item TV show ingest for ${subject}.` };
  }
  if (programType === "SEASON") {
    return {
      name: buildDocumentName(subject, `${index ? `S${index}` : "Season"} Ingest`),
      description: `Single-item season ingest for ${subject}${index ? ` season ${index}` : ""}.`,
    };
  }
  if (programType === "EPISODE") {
    if (seasonIndex && index) {
      return {
        name: buildDocumentName(subject, `S${seasonIndex} E${index} Ingest`),
        description: `Single-item episode ingest for ${subject}, season ${seasonIndex} episode ${index}.`,
      };
    }
    if (index) {
      return {
        name: buildDocumentName(subject, `Episode ${index} Ingest`),
        description: `Single-item episode ingest for ${subject}, episode ${index}.`,
      };
    }
    return { name: buildDocumentName(subject, "Episode Ingest"), description: `Single-item episode ingest for ${subject}.` };
  }
  if (programType === "TRAILER") {
    return { name: buildDocumentName(subject, "Trailer Ingest"), description: `Single-item trailer ingest for ${subject}.` };
  }
  if (programType === "EXTRA") {
    return { name: buildDocumentName(subject, "Extra Ingest"), description: `Single-item extra ingest for ${subject}.` };
  }
  return { name: buildDocumentName(subject, "Ingest"), description: `Single-item ingest for ${subject}.` };
}

function suggestSingleDocumentMetadata() {
  return suggestDocumentMetadataForFields({
    program_type: byId("field-program_type").value,
    title: readInputValue(byId("field-title")),
    external_id: readInputValue(byId("field-external_id")),
    parent_external_id: readInputValue(byId("field-parent_external_id")),
    index: readInputValue(byId("field-index")),
  });
}

function defaultBatchMetadata(mode) {
  if (mode === "bulk") {
    return {
      name: "Axinom Bulk Ingest",
      description: "Bulk ingest converted from the current workbook.",
    };
  }
  return {
    name: "Axinom Direct Sheet Ingest",
    description: "Direct sheet ingest built from the current row set.",
  };
}

function suggestBatchDocumentMetadata(rows, mode) {
  const meaningfulRows = (rows || []).filter((row) => Object.values(row || {}).some((value) => normalizeString(value)));
  if (!meaningfulRows.length) {
    return defaultBatchMetadata(mode);
  }

  const firstFields = mapRowToFields(meaningfulRows[0]);
  const subject = documentSubjectFromFields(firstFields);
  const batchSuffix = mode === "bulk" ? "Bulk Ingest" : "Direct Sheet Ingest";
  const batchLabel = mode === "bulk" ? "Bulk ingest" : "Direct sheet ingest";
  const itemCount = meaningfulRows.length;

  return {
    name: buildDocumentName(subject, batchSuffix),
    description: itemCount > 1
      ? `${batchLabel} for ${subject} plus ${itemCount - 1} more item(s).`
      : `${batchLabel} for ${subject}.`,
  };
}

function suggestBulkMetadataFromFile(fileName) {
  const stem = normalizeString(fileName).replace(/\.[^.]+$/, "");
  const subject = stem ? humanizeIdentifier(stem) || stem : "Workbook";
  return {
    name: buildDocumentName(subject, "Bulk Ingest"),
    description: `Bulk ingest converted from ${fileName || "the current workbook"}.`,
  };
}

function syncSingleDocumentMetadata(force = false) {
  const nameInput = byId("single-name");
  const descriptionInput = byId("single-description");
  const suggestions = suggestSingleDocumentMetadata();

  state.autoSyncingDocumentMetadata = true;
  if (force || !state.singleNameDirty || !normalizeString(nameInput.value)) {
    nameInput.value = suggestions.name;
  }
  if (force || !state.singleDescriptionDirty || !normalizeString(descriptionInput.value)) {
    descriptionInput.value = suggestions.description;
  }
  state.autoSyncingDocumentMetadata = false;

  if (force) {
    state.singleNameDirty = false;
    state.singleDescriptionDirty = false;
  }

  setCurrentDownloadName(nameInput.value || "axinom-ingest");
}

async function syncBulkDocumentMetadata(force = false) {
  const nameInput = byId("bulk-name");
  const descriptionInput = byId("bulk-description");
  const file = byId("bulk-file")?.files?.[0];
  const requestId = ++state.bulkPreviewRequestId;

  let suggestions = defaultBatchMetadata("bulk");
  if (file) {
    suggestions = suggestBulkMetadataFromFile(file.name);
    try {
      const parsed = await parseXlsxRows(file, normalizeString(byId("bulk-sheet").value));
      if (requestId !== state.bulkPreviewRequestId) {
        return;
      }
      suggestions = suggestBatchDocumentMetadata(parsed.rows, "bulk");
    } catch (_error) {
      if (requestId !== state.bulkPreviewRequestId) {
        return;
      }
    }
  }

  state.autoSyncingDocumentMetadata = true;
  if (force || !state.bulkNameDirty || !normalizeString(nameInput.value)) {
    nameInput.value = suggestions.name;
  }
  if (force || !state.bulkDescriptionDirty || !normalizeString(descriptionInput.value)) {
    descriptionInput.value = suggestions.description;
  }
  state.autoSyncingDocumentMetadata = false;
}

function syncDirectDocumentMetadata(force = false) {
  const nameInput = byId("direct-name");
  const descriptionInput = byId("direct-description");
  const suggestions = suggestBatchDocumentMetadata(readDirectRows(), "direct");

  state.autoSyncingDocumentMetadata = true;
  if (force || !state.directNameDirty || !normalizeString(nameInput.value)) {
    nameInput.value = suggestions.name;
  }
  if (force || !state.directDescriptionDirty || !normalizeString(descriptionInput.value)) {
    descriptionInput.value = suggestions.description;
  }
  state.autoSyncingDocumentMetadata = false;
}

function formatDocumentNameError(name) {
  const clean = normalizeString(name);
  if (!clean) {
    return "Document Name is required.";
  }
  if (clean.length > DOCUMENT_NAME_MAX_LENGTH) {
    return `Document Name must be ${DOCUMENT_NAME_MAX_LENGTH} characters or fewer.`;
  }
  return "";
}

function splitMulti(value, { uppercase = false } = {}) {
  const tokens = normalizeString(value)
    .split(/[;,\n]/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  return uppercase ? tokens.map((token) => token.toUpperCase()) : tokens;
}

function parseDateOnlyValue(value) {
  const text = normalizeString(value);
  if (!text) {
    return "";
  }

  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return buildValidatedDate(Number(match[1]), Number(match[2]), Number(match[3])) || text;
  }

  match = text.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (match) {
    return buildValidatedDate(Number(match[1]), Number(match[2]), Number(match[3])) || text;
  }

  match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    return buildValidatedDate(Number(match[3]), Number(match[1]), Number(match[2])) || text;
  }

  match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (match) {
    const shortYear = Number(match[3]);
    const year = shortYear <= 68 ? 2000 + shortYear : 1900 + shortYear;
    return buildValidatedDate(year, Number(match[1]), Number(match[2])) || text;
  }

  match = text.match(/^(\d{4})$/);
  if (match) {
    return `${match[1]}-01-01`;
  }

  return "";
}

function buildValidatedDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${padTwoDigits(month)}-${padTwoDigits(day)}`;
}

function parseDateValue(value) {
  const text = normalizeString(value);
  if (!text) {
    return "";
  }

  const dateOnly = parseDateOnlyValue(text);
  if (dateOnly) {
    return dateOnly;
  }

  const datetime = parseDateTimeToUtcString(text, "start");
  if (/^\d{4}-\d{2}-\d{2}T/.test(datetime)) {
    return datetime.slice(0, 10);
  }

  return text;
}

function normalizeHour(hour, meridiem) {
  let result = Number(hour);
  if (Number.isNaN(result)) {
    return null;
  }
  if (!meridiem) {
    return result;
  }
  const upper = meridiem.toUpperCase();
  if (upper === "AM") {
    return result === 12 ? 0 : result;
  }
  if (upper === "PM") {
    return result === 12 ? 12 : result + 12;
  }
  return result;
}

function formatDateTimeParts(year, month, day, hour, minute, second = 0, millisecond = 0, timezone = "+00:00") {
  const dateValue = buildValidatedDate(year, month, day);
  if (!dateValue) {
    return "";
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return "";
  }
  return `${dateValue}T${padTwoDigits(hour)}:${padTwoDigits(minute)}:${padTwoDigits(second)}.${String(millisecond).padStart(3, "0")}${timezone}`;
}

function parseDateTimeToUtcString(value, boundary = "start") {
  const text = normalizeString(value);
  if (!text) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+\-]\d{2}:\d{2})$/.test(text)) {
    return text.replace(/Z$/, "+00:00").replace(/\.(\d{1,2})([+\-]\d{2}:\d{2})$/, (_, ms, tz) => `.${ms.padEnd(3, "0")}${tz}`);
  }

  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?\s*(AM|PM)?$/i);
  if (!match) {
    match = text.match(/^(\d{4})\/(\d{2})\/(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?\s*(AM|PM)?$/i);
  }
  if (!match) {
    match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?\s*(AM|PM)?$/i);
    if (match) {
      const hour = normalizeHour(match[4], match[8]);
      if (hour !== null) {
        return formatDateTimeParts(Number(match[3]), Number(match[1]), Number(match[2]), hour, Number(match[5]), Number(match[6] || 0), Number(String(match[7] || "0").padEnd(3, "0")));
      }
    }
  } else {
    const hour = normalizeHour(match[4], match[8]);
    if (hour !== null) {
      return formatDateTimeParts(Number(match[1]), Number(match[2]), Number(match[3]), hour, Number(match[5]), Number(match[6] || 0), Number(String(match[7] || "0").padEnd(3, "0")));
    }
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) {
    return `${text}:00.000+00:00`;
  }

  const dateOnly = parseDateOnlyValue(text);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return boundary === "end"
      ? `${dateOnly}T23:59:59.999+00:00`
      : `${dateOnly}T00:00:00.000+00:00`;
  }

  return text;
}

function buildData(fields) {
  const data = {};

  const addText = (source, target = source) => {
    const value = normalizeString(fields[source]);
    if (value) {
      data[target] = value;
    }
  };

  addText("title");
  addText("original_title");
  addText("description");
  addText("synopsis");

  const released = parseDateValue(fields.released);
  if (released) {
    data.released = released;
  }

  addText("studio");
  addText("parent_external_id");

  const index = normalizeString(fields.index);
  if (index) {
    data.index = index;
  }

  [["tags", false], ["genres", false], ["cast", false], ["production_countries", false]].forEach(([field, uppercase]) => {
    const parsed = splitMulti(fields[field], { uppercase });
    if (parsed.length) {
      data[field] = parsed;
    }
  });

  const licenseStart = parseDateTimeToUtcString(fields.license_start, "start");
  const licenseEnd = parseDateTimeToUtcString(fields.license_end, "end");
  const licenseCountries = splitMulti(fields.license_countries, { uppercase: true });
  if (licenseStart || licenseEnd || licenseCountries.length) {
    const licenseEntry = {};
    if (licenseStart) {
      licenseEntry.start = licenseStart;
    }
    if (licenseEnd) {
      licenseEntry.end = licenseEnd;
    }
    if (licenseCountries.length) {
      licenseEntry.countries = licenseCountries;
    }
    data.licenses = [licenseEntry];
  }

  const videoSource = normalizeString(fields.video_source);
  const videoProfile = normalizeString(fields.video_profile);
  if (videoSource || videoProfile) {
    const mainVideo = {};
    if (videoSource) {
      mainVideo.source = videoSource;
    }
    if (videoProfile) {
      mainVideo.profile = videoProfile;
    }
    data.main_video = mainVideo;
  }

  const images = [];
  const coverImage = normalizeString(fields.cover_image);
  const teaserImage = normalizeString(fields.teaser_image);
  if (coverImage) {
    images.push({ path: coverImage, type: "COVER" });
  }
  if (teaserImage) {
    images.push({ path: teaserImage, type: "TEASER" });
  }
  if (images.length) {
    data.images = images;
  }

  return data;
}

function deriveParentExternalId(externalId, ingestType) {
  if (!externalId) {
    return "";
  }
  if (ingestType === "EPISODE") {
    const parent = externalId.replace(/([_-]E\d+)$/i, "");
    return parent !== externalId ? parent : "";
  }
  if (ingestType === "SEASON") {
    const parent = externalId.replace(/([_-]S\d+)$/i, "");
    return parent !== externalId ? parent : "";
  }
  return "";
}

function buildItem(fields) {
  const errors = [];
  const warnings = [];
  const normalizedType = normalizeProgramType(fields.program_type);
  const config = PROGRAM_TYPE_CONFIG[normalizedType];

  if (!config) {
    return {
      item: null,
      errors: [`Unsupported program type '${normalizeString(fields.program_type)}'. Supported values: ${PROGRAM_TYPES.join(", ")}.`],
      warnings,
    };
  }

  const ingestType = config.ingestType;
  const externalId = normalizeString(fields.external_id);
  const parentType = normalizeProgramType(fields.parent_type);
  const data = buildData(fields);

  if (ingestType === "TVSHOW" || ingestType === "SEASON") {
    delete data.main_video;
  }
  if (ingestType === "TRAILER") {
    delete data.trailers;
  }

  if (!data.parent_external_id) {
    const derivedParent = deriveParentExternalId(externalId, ingestType);
    if (derivedParent) {
      data.parent_external_id = derivedParent;
      warnings.push("Derived parent_external_id from external_id");
    }
  }

  const mainVideo = data.main_video || {};
  if (mainVideo.profile && !mainVideo.source) {
    errors.push("Field 'main_video.source' is required when 'main_video.profile' is set");
  }

  for (const trailer of data.trailers || []) {
    if (trailer.profile && !trailer.source) {
      errors.push("Field 'trailers[].source' is required when 'trailers[].profile' is set");
    }
  }

  if (parentType && !PROGRAM_TYPE_CONFIG[parentType]) {
    errors.push(`Field 'parent_type' must be one of: ${PROGRAM_TYPES.join(", ")}`);
  } else if (config.allowedParentTypes.length && parentType && !config.allowedParentTypes.includes(parentType)) {
    errors.push(`Field 'parent_type' must be one of: ${config.allowedParentTypes.join(", ")}`);
  }

  for (const field of config.required) {
    if (field === "external_id") {
      if (!externalId) {
        errors.push("Missing required field: external_id");
      }
      continue;
    }
    if (field === "index") {
      if (!Object.prototype.hasOwnProperty.call(data, "index")) {
        errors.push("Missing required field: index");
      }
      continue;
    }
    if (field === "parent_type") {
      if (!parentType) {
        errors.push("Missing required field: parent_type");
      }
      continue;
    }
    const value = data[field];
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "index")) {
    const parsedIndex = Number.parseInt(data.index, 10);
    if (!Number.isInteger(parsedIndex) || parsedIndex < 1) {
      errors.push("Field 'index' must be an integer greater than 0");
    } else {
      data.index = parsedIndex;
    }
  }

  if (!Object.keys(data).length) {
    errors.push("No metadata values were provided for data payload");
  }

  if (errors.length) {
    return { item: null, errors, warnings };
  }

  return {
    item: {
      type: ingestType,
      external_id: externalId,
      data,
    },
    errors,
    warnings,
  };
}

function normalizeHeader(header) {
  return normalizeString(header).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pickExternalId(candidates) {
  if (!candidates.length) {
    return "";
  }

  const priority = { externalid: 0, titlealternateid: 1, guid: 2, series: 3, id: 4 };
  const ranked = [...candidates].sort((left, right) => (priority[left[0]] ?? 99) - (priority[right[0]] ?? 99));
  const [bestHeader, bestValue] = ranked[0];

  if (bestHeader === "guid" && /^\d+$/.test(bestValue)) {
    const seriesCandidate = ranked.find(([header, value]) => header === "series" && /[A-Za-z]/.test(value) && value.includes("_"));
    if (seriesCandidate) {
      return seriesCandidate[1];
    }
  }

  return bestValue;
}

function mapRowToFields(row) {
  const mapped = {};
  const externalCandidates = [];

  Object.entries(row).forEach(([header, value]) => {
    const normalizedHeader = normalizeHeader(header);
    const field = HEADER_TO_FIELD[normalizedHeader];
    const cleaned = normalizeString(value);
    if (!field || !cleaned) {
      return;
    }

    if (field === "external_id") {
      externalCandidates.push([normalizedHeader, cleaned]);
      return;
    }

    if (!mapped[field]) {
      mapped[field] = cleaned;
    }
  });

  mapped.external_id = pickExternalId(externalCandidates);

  const programType = normalizeProgramType(mapped.program_type);
  if (programType === "EPISODE") {
    mapped.index = normalizeString(mapped.episode_index) || normalizeString(mapped.index);
  } else if (programType === "SEASON") {
    mapped.index = normalizeString(mapped.season_index) || normalizeString(mapped.index);
  } else {
    mapped.index = normalizeString(mapped.index);
  }

  if (mapped.released && /^\d{4}$/.test(mapped.released)) {
    mapped.released = `${mapped.released}-01-01`;
  }

  return mapped;
}

function typeNoun(programType, plural = true) {
  const singular = {
    MOVIE: "Movie",
    TVSHOW: "TV show",
    SEASON: "Season",
    EPISODE: "Episode",
    TRAILER: "Trailer",
    EXTRA: "Extra",
  };
  const base = singular[programType] || "Item";
  return plural && !base.endsWith("s") ? `${base}s` : base;
}

function sheetErrorFieldCandidates(field) {
  const mapping = {
    program_type: ["assettype", "programtype"],
    external_id: ["externalid", "titlealternateid", "guid", "series", "id"],
    title: ["title"],
    index: ["seasonepnumber", "seasonepisodeindex", "episodenumber", "seasonnumber"],
    parent_type: ["parenttype"],
    parent_external_id: ["parentexternalid"],
    video_source: ["videosource"],
  };
  return mapping[field] || [field];
}

function sheetErrorCellRef(field, rowCells) {
  const normalizedToCells = Object.entries(rowCells || {}).map(([header, cell]) => [normalizeHeader(header), cell]);
  for (const candidate of sheetErrorFieldCandidates(field)) {
    for (const [normalizedHeader, cellRef] of normalizedToCells) {
      if (normalizedHeader === candidate) {
        return cellRef;
      }
    }
  }
  return "";
}

function formatSheetErrorMessage(error, { rowNumber, rowCells, normalizedProgramType }) {
  let field = "";
  let message = error;

  if (error.startsWith("Missing required field: ")) {
    field = error.split(": ", 2)[1].trim();
    if (field === "external_id") {
      message = "External ID is required";
    } else if (field === "title") {
      message = `${typeNoun(normalizedProgramType)} must have a title`;
    } else if (field === "index") {
      message = `${typeNoun(normalizedProgramType)} must have a number`;
    } else if (field === "parent_type") {
      message = `${typeNoun(normalizedProgramType)} must have a parent type`;
    } else if (field === "parent_external_id") {
      message = `${typeNoun(normalizedProgramType)} must have a parent external ID`;
    }
  } else if (error === "Field 'index' must be an integer greater than 0") {
    field = "index";
    message = `${typeNoun(normalizedProgramType)} must have a number greater than 0`;
  } else if (error === "Field 'main_video.source' is required when 'main_video.profile' is set") {
    field = "video_source";
    message = "Video Source is required when Video Profile is set";
  } else if (error.startsWith("Field 'parent_type' must be one of: ")) {
    field = "parent_type";
    message = error.replace("Field 'parent_type' ", "Parent Type ");
  } else if (error.startsWith("Unsupported program type ")) {
    field = "program_type";
  }

  const cellRef = field ? sheetErrorCellRef(field, rowCells || {}) : "";
  return cellRef ? `Error at ${cellRef}: ${message}` : `Error at row ${rowNumber}: ${message}`;
}

function rowsToDocument({ rows, documentName, sourceName, sheetName, documentDescription = "", rowNumbers = [], rowCells = [] }) {
  const items = [];
  const warnings = [];
  const rowErrors = [];

  rows.forEach((row, index) => {
    const rowNumber = rowNumbers[index] || index + 2;
    const rowCellMap = rowCells[index] || {};
    const fields = mapRowToFields(row);

    if (!Object.values(fields).some((value) => normalizeString(value))) {
      return;
    }

    const buildResult = buildItem(fields);
    if (buildResult.errors.length) {
      rowErrors.push({
        row: rowNumber,
        errors: buildResult.errors.map((error) => formatSheetErrorMessage(error, {
          rowNumber,
          rowCells: rowCellMap,
          normalizedProgramType: normalizeProgramType(fields.program_type),
        })),
        raw_row: row,
      });
      return;
    }

    items.push(buildResult.item);
    buildResult.warnings.forEach((warning) => warnings.push(`Row ${rowNumber}: ${warning}`));
  });

  const nameError = formatDocumentNameError(documentName);
  if (nameError) {
    rowErrors.push({ row: 0, errors: [nameError], raw_row: {} });
  }

  if (!items.length && !rowErrors.length) {
    rowErrors.push({ row: 0, errors: ["No ingest rows found in spreadsheet."], raw_row: {} });
  }

  const ok = items.length > 0 && rowErrors.length === 0;
  const document = ok
    ? {
        name: normalizeString(documentName),
        ...(normalizeString(documentDescription) ? { description: normalizeString(documentDescription) } : {}),
        items,
        document_created: currentDocumentCreated(),
        helper_version: HELPER_VERSION,
      }
    : null;

  return {
    ok,
    document,
    errors: rowErrors,
    warnings,
    stats: {
      source: sourceName,
      sheet: sheetName,
      rows_read: rows.length,
      items_created: items.length,
      rows_failed: rowErrors.length,
    },
  };
}

function collectSinglePayload() {
  const visible = currentVisibleSingleFields();
  const fields = {};

  SINGLE_FIELD_IDS.forEach((fieldId) => {
    const element = byId(`field-${fieldId}`);
    const value = readInputValue(element);
    if (fieldId === "program_type" || fieldId === "external_id" || visible.has(fieldId)) {
      fields[fieldId] = value;
    } else {
      fields[fieldId] = "";
    }
  });

  return {
    name: readInputValue(byId("single-name")),
    description: readInputValue(byId("single-description")),
    fields,
  };
}

function validateSinglePayload(payload) {
  const programType = payload.fields.program_type;
  const required = requiredFieldsForSingle(programType, currentSingleIngestMode());
  const missingLabels = [];

  required.forEach((fieldId) => {
    if (fieldId === "program_type") {
      return;
    }
    if (!normalizeString(payload.fields[fieldId])) {
      missingLabels.push(singleFieldLabel(fieldId));
    }
  });

  if (missingLabels.length) {
    return `Missing required fields: ${missingLabels.join(", ")}`;
  }
  return formatDocumentNameError(payload.name);
}

function generateSingle() {
  const payload = collectSinglePayload();
  const validationError = validateSinglePayload(payload);
  if (validationError) {
    setStatus(validationError, "error");
    return;
  }

  const buildResult = buildItem(payload.fields);
  if (buildResult.errors.length) {
    setStatus(buildResult.errors.join(" | "), "error");
    return;
  }

  const document = {
    name: normalizeString(payload.name),
    ...(normalizeString(payload.description) ? { description: normalizeString(payload.description) } : {}),
    items: [buildResult.item],
    document_created: currentDocumentCreated(),
    helper_version: HELPER_VERSION,
  };

  updateAllDocumentMetaDisplays(document);
  renderDocument(document);
  setCurrentDownloadName(document.name);

  if (buildResult.warnings.length) {
    setStatus(`Generated with warning(s): ${buildResult.warnings.join(" | ")}`, "warn");
    return;
  }

  setStatus("Single item JSON generated.", "ok");
}

function clearSingle() {
  byId("field-program_type").value = "MOVIE";
  byId("single-ingest-mode").value = "SIMPLE";
  state.singleNameDirty = false;
  state.singleDescriptionDirty = false;

  SINGLE_FIELD_IDS.forEach((fieldId) => {
    const element = byId(`field-${fieldId}`);
    if (!element || fieldId === "program_type") {
      return;
    }
    if (element instanceof HTMLSelectElement && element.multiple) {
      [...element.options].forEach((option) => {
        option.selected = false;
      });
    } else {
      element.value = "";
    }
  });

  byId("single-description").value = "";
  updateAllDocumentMetaDisplays();
  syncSingleDocumentMetadata(true);
  updateRequiredHint();
  updateVisibleFields();
  renderDocument(null);
  setStatus("Ready.");
}

function formatErrors(result) {
  if (Array.isArray(result.errors) && result.errors.length && typeof result.errors[0] === "object") {
    return result.errors.map((entry) => {
      const details = Array.isArray(entry.errors) ? entry.errors.join(" | ") : String(entry.errors || "Unknown error");
      return /^Error at /i.test(details) ? details : `${entry.row ? `Row ${entry.row}` : "File"}: ${details}`;
    }).join(" | ");
  }

  if (Array.isArray(result.errors)) {
    return result.errors.join(" | ");
  }

  return result.error || "Request failed";
}

function exportableJsonString() {
  if (state.currentDocument && typeof state.currentDocument === "object") {
    return JSON.stringify(state.currentDocument, null, 2);
  }
  setStatus("Generate a valid document before exporting JSON.", "error");
  return "";
}

function copyOutput() {
  const exportJson = exportableJsonString();
  if (!exportJson) {
    return;
  }
  navigator.clipboard.writeText(exportJson).then(
    () => setStatus("JSON copied to clipboard.", "ok"),
    () => setStatus("Clipboard copy failed. You can manually copy from the output window.", "error"),
  );
}

function downloadOutput() {
  const exportJson = exportableJsonString();
  if (!exportJson) {
    return;
  }
  const blob = new Blob([exportJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.currentDownloadName || "axinom-ingest"}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function directInputConfig(columnName) {
  if (columnName === "Asset Type") {
    return { kind: "program-type-select" };
  }
  if (columnName === "Parent Type") {
    return { kind: "parent-type-select" };
  }
  if (columnName === "License Countries") {
    return { kind: "country-picker" };
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
  if (columnName === "Production Countries") {
    return { kind: "input", type: "text", list: "country-code-list" };
  }
  if (columnName === "Video Profile") {
    return { kind: "input", type: "text", list: "video-profile-list" };
  }
  return { kind: "input", type: "text" };
}

function directColumnKey(columnName) {
  return columnName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function closeOpenCountryPickers(exceptNode = null) {
  document.querySelectorAll(".country-picker[open]").forEach((node) => {
    if (node !== exceptNode) {
      node.open = false;
    }
  });
}

function readCountryPickerValues(node) {
  if (!node) {
    return [];
  }
  const selected = [...node.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => normalizeString(input.value).toUpperCase())
    .filter(Boolean);
  const manualInput = node.querySelector('[data-country-manual="true"]');
  const manual = manualInput
    ? splitMulti(manualInput.value, { uppercase: true }).filter((value) => !COMMON_COUNTRY_CODES.includes(value))
    : [];
  return [...new Set([...selected, ...manual])];
}

function updateCountryPickerSummary(node) {
  if (!node) {
    return;
  }
  const summaryText = node.querySelector(".country-picker-value");
  if (!summaryText) {
    return;
  }
  const values = readCountryPickerValues(node);
  if (values.length) {
    summaryText.textContent = values.join(", ");
    summaryText.classList.remove("country-picker-placeholder");
  } else {
    summaryText.textContent = "Select";
    summaryText.classList.add("country-picker-placeholder");
  }
}

function createCountryPickerWidget(initialValue = "") {
  const wrapper = document.createElement("details");
  wrapper.className = "country-picker";
  wrapper.dataset.multiCountry = "true";

  const summary = document.createElement("summary");
  const summaryText = document.createElement("span");
  summaryText.className = "country-picker-value";
  summary.appendChild(summaryText);

  const panel = document.createElement("div");
  panel.className = "country-picker-panel";

  COMMON_COUNTRY_CODES.forEach((code) => {
    const label = document.createElement("label");
    label.className = "country-picker-option";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = code;
    const text = document.createElement("span");
    text.textContent = code;
    label.appendChild(input);
    label.appendChild(text);
    panel.appendChild(label);
  });

  const manualField = document.createElement("label");
  manualField.className = "country-picker-manual";
  manualField.textContent = "Other codes";
  const manualInput = document.createElement("input");
  manualInput.type = "text";
  manualInput.setAttribute("list", "country-code-list");
  manualInput.placeholder = "MX, GB";
  manualInput.dataset.countryManual = "true";
  manualField.appendChild(manualInput);
  panel.appendChild(manualField);

  const values = splitMulti(initialValue, { uppercase: true });
  const manualValues = [];
  [...panel.querySelectorAll('input[type="checkbox"]')].forEach((input) => {
    input.checked = values.includes(input.value);
  });
  values.forEach((value) => {
    if (!COMMON_COUNTRY_CODES.includes(value)) {
      manualValues.push(value);
    }
  });
  manualInput.value = manualValues.join(", ");

  wrapper.appendChild(summary);
  wrapper.appendChild(panel);
  wrapper.addEventListener("toggle", () => {
    if (wrapper.open) {
      closeOpenCountryPickers(wrapper);
    }
  });
  wrapper.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener("change", () => updateCountryPickerSummary(wrapper));
  });
  manualInput.addEventListener("input", () => updateCountryPickerSummary(wrapper));
  updateCountryPickerSummary(wrapper);
  return wrapper;
}

function createCellInput(columnName, initialValue = "") {
  const config = directInputConfig(columnName);

  if (config.kind === "program-type-select") {
    const select = document.createElement("select");
    populateSingleSelect(select, PROGRAM_TYPES, initialValue);
    return select;
  }

  if (config.kind === "parent-type-select") {
    const select = document.createElement("select");
    populateSingleSelect(select, [], initialValue);
    return select;
  }

  if (config.kind === "country-picker") {
    return createCountryPickerWidget(initialValue);
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
  if (columnName === "License Start (UTC)") {
    bindDefaultDateTimeLocalTime(input, 21, 0);
  } else if (columnName === "License End (UTC)") {
    bindDefaultDateTimeLocalTime(input, 23, 59);
  }
  return input;
}

function directRowInput(row, columnName) {
  return row.querySelector(`[data-column-key="${directColumnKey(columnName)}"]`);
}

function readDirectCellValue(node, columnName) {
  if (!node) {
    return "";
  }

  if (columnName === "License Countries" && node.dataset.multiCountry === "true") {
    return readCountryPickerValues(node).join(", ");
  }

  return normalizeString(node.value);
}

function updateDirectParentTypeOptions(row, preferredValue = "") {
  const assetTypeInput = directRowInput(row, "Asset Type");
  const parentTypeInput = directRowInput(row, "Parent Type");
  if (!assetTypeInput || !parentTypeInput) {
    return;
  }
  populateSingleSelect(parentTypeInput, allowedParentTypesFor(assetTypeInput.value), preferredValue || parentTypeInput.value);
}

function updateDirectRowNumbers() {
  byId("direct-table").querySelectorAll("tbody tr").forEach((row, index) => {
    const marker = row.querySelector(".row-marker");
    if (marker) {
      marker.textContent = String(index + 1);
    }
  });
}

function appendDirectRow(initialValues = {}) {
  const tbody = byId("direct-table").querySelector("tbody");
  const row = document.createElement("tr");

  const marker = document.createElement("td");
  marker.className = "row-marker";
  row.appendChild(marker);

  DIRECT_COLUMNS.forEach((column) => {
    const cell = document.createElement("td");
    const control = createCellInput(column, initialValues[column] || "");
    control.dataset.columnKey = directColumnKey(column);
    const eventTargets = control.matches?.("input, select, textarea")
      ? [control]
      : [...control.querySelectorAll("input, select, textarea")];

    eventTargets.forEach((target) => {
      target.addEventListener("input", () => syncDirectDocumentMetadata());
      target.addEventListener("change", () => syncDirectDocumentMetadata());
    });

    if (column === "Asset Type") {
      eventTargets.forEach((target) => {
        target.addEventListener("change", () => updateDirectParentTypeOptions(row));
      });
    }

    cell.appendChild(control);
    row.appendChild(cell);
  });

  tbody.appendChild(row);
  updateDirectParentTypeOptions(row, initialValues["Parent Type"] || "");
  updateDirectRowNumbers();
}

function buildDirectTable() {
  const table = byId("direct-table");
  table.innerHTML = "";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const rowHeader = document.createElement("th");
  rowHeader.textContent = "#";
  headRow.appendChild(rowHeader);
  DIRECT_COLUMNS.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  for (let index = 0; index < 6; index += 1) {
    appendDirectRow();
  }
}

function readDirectRows() {
  const rows = [];
  byId("direct-table").querySelectorAll("tbody tr").forEach((row) => {
    const values = {};
    DIRECT_COLUMNS.forEach((column) => {
      values[column] = readDirectCellValue(directRowInput(row, column), column);
    });
    if (Object.values(values).some(Boolean)) {
      rows.push(values);
    }
  });
  return rows;
}

function clearDirectRows() {
  buildDirectTable();
  syncDirectDocumentMetadata();
}

function convertDirectRows() {
  const documentName = normalizeString(byId("direct-name").value || "Axinom Direct Sheet Ingest");
  const nameError = formatDocumentNameError(documentName);
  if (nameError) {
    setStatus(nameError, "error");
    return;
  }

  const rows = readDirectRows();
  if (!rows.length) {
    setStatus("Enter at least one row in the direct sheet.", "error");
    return;
  }

  const result = rowsToDocument({
    rows,
    documentName,
    sourceName: "direct-sheet",
    sheetName: "Direct Entry",
    documentDescription: normalizeString(byId("direct-description").value),
  });

  if (result.document) {
    updateAllDocumentMetaDisplays(result.document);
    renderDocument(result.document);
    setCurrentDownloadName(result.document.name || documentName);
  }

  if (!result.ok) {
    setStatus(formatErrors(result), "error");
    return;
  }

  const summary = `Converted ${result.stats.items_created || 0} direct row item(s) from ${result.stats.rows_read || 0} row(s).`;
  if (result.warnings.length) {
    setStatus(`${summary} Warning(s): ${result.warnings.join(" | ")}`, "warn");
    return;
  }
  setStatus(summary, "ok");
}

function renderTemplateDownload(versionKey) {
  const path = TEMPLATE_FILES[versionKey] || TEMPLATE_FILES.latest;
  const link = document.createElement("a");
  link.href = path;
  link.download = path.split("/").pop();
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function inflateRaw(data) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function readUint16LE(view, offset) {
  return view.getUint16(offset, true);
}

function readUint32LE(view, offset) {
  return view.getUint32(offset, true);
}

function decodeText(bytes) {
  return new TextDecoder("utf-8").decode(bytes);
}

function concatPath(basePath, target) {
  if (target.startsWith("/")) {
    return target.replace(/^\//, "");
  }
  const parts = basePath.split("/");
  parts.pop();
  target.split("/").forEach((segment) => {
    if (!segment || segment === ".") {
      return;
    }
    if (segment === "..") {
      parts.pop();
      return;
    }
    parts.push(segment);
  });
  return parts.join("/");
}

async function unzipEntries(arrayBuffer) {
  if (typeof DecompressionStream !== "function") {
    throw new Error("This browser does not support the built-in decompression API needed for .xlsx imports.");
  }

  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  const eocdSignature = 0x06054b50;
  const centralSignature = 0x02014b50;
  const localSignature = 0x04034b50;

  let eocdOffset = -1;
  const searchStart = Math.max(0, bytes.length - 0x10000 - 22);
  for (let offset = bytes.length - 22; offset >= searchStart; offset -= 1) {
    if (readUint32LE(view, offset) === eocdSignature) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset < 0) {
    throw new Error("Could not locate the end of the ZIP directory in the workbook.");
  }

  const totalEntries = readUint16LE(view, eocdOffset + 10);
  let directoryOffset = readUint32LE(view, eocdOffset + 16);
  const entries = new Map();

  for (let index = 0; index < totalEntries; index += 1) {
    if (readUint32LE(view, directoryOffset) !== centralSignature) {
      throw new Error("Corrupt ZIP central directory entry in workbook.");
    }

    const compressionMethod = readUint16LE(view, directoryOffset + 10);
    const compressedSize = readUint32LE(view, directoryOffset + 20);
    const fileNameLength = readUint16LE(view, directoryOffset + 28);
    const extraLength = readUint16LE(view, directoryOffset + 30);
    const commentLength = readUint16LE(view, directoryOffset + 32);
    const localHeaderOffset = readUint32LE(view, directoryOffset + 42);
    const fileNameBytes = bytes.slice(directoryOffset + 46, directoryOffset + 46 + fileNameLength);
    const fileName = decodeText(fileNameBytes);

    if (readUint32LE(view, localHeaderOffset) !== localSignature) {
      throw new Error(`Corrupt ZIP local header for ${fileName}.`);
    }

    const localNameLength = readUint16LE(view, localHeaderOffset + 26);
    const localExtraLength = readUint16LE(view, localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressedBytes = bytes.slice(dataOffset, dataOffset + compressedSize);

    let contentBytes;
    if (compressionMethod === 0) {
      contentBytes = compressedBytes;
    } else if (compressionMethod === 8) {
      contentBytes = await inflateRaw(compressedBytes);
    } else {
      throw new Error(`Unsupported workbook compression method ${compressionMethod} for ${fileName}.`);
    }

    entries.set(fileName, contentBytes);
    directoryOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function xmlDocument(bytes) {
  return new DOMParser().parseFromString(decodeText(bytes), "application/xml");
}

function firstChildByLocalName(node, localName) {
  return [...node.children].find((child) => child.localName === localName) || null;
}

function childText(node, localName) {
  const child = firstChildByLocalName(node, localName);
  return child ? child.textContent || "" : "";
}

function colLettersToIndex(colLetters) {
  let value = 0;
  for (const char of colLetters) {
    value = (value * 26) + (char.charCodeAt(0) - 64);
  }
  return value - 1;
}

function indexToCol(index) {
  let value = index + 1;
  let letters = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    value = Math.floor((value - 1) / 26);
  }
  return letters;
}

function parseSharedStrings(entries) {
  const bytes = entries.get("xl/sharedStrings.xml");
  if (!bytes) {
    return [];
  }
  const doc = xmlDocument(bytes);
  return [...doc.getElementsByTagNameNS("*", "si")].map((node) => {
    const texts = [...node.getElementsByTagNameNS("*", "t")].map((textNode) => textNode.textContent || "");
    return texts.join("");
  });
}

function parseWorkbookSheets(entries) {
  const workbookBytes = entries.get("xl/workbook.xml");
  const relBytes = entries.get("xl/_rels/workbook.xml.rels");
  if (!workbookBytes || !relBytes) {
    throw new Error("Workbook metadata is missing required XML parts.");
  }

  const workbookDoc = xmlDocument(workbookBytes);
  const relDoc = xmlDocument(relBytes);
  const relMap = new Map();
  [...relDoc.getElementsByTagNameNS("*", "Relationship")].forEach((relationship) => {
    relMap.set(relationship.getAttribute("Id"), relationship.getAttribute("Target"));
  });

  return [...workbookDoc.getElementsByTagNameNS("*", "sheet")].map((sheet) => {
    const name = sheet.getAttribute("name") || "Sheet";
    const rid = sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id") || sheet.getAttribute("r:id");
    const target = relMap.get(rid);
    return target ? { name, target: target.startsWith("/") ? target.replace(/^\//, "") : concatPath("xl/workbook.xml", target) } : null;
  }).filter(Boolean);
}

function cellValue(cell, sharedStrings) {
  const cellType = cell.getAttribute("t");
  if (cellType === "inlineStr") {
    return [...cell.getElementsByTagNameNS("*", "t")].map((node) => node.textContent || "").join("").trim();
  }
  const valueNode = firstChildByLocalName(cell, "v");
  const text = valueNode ? (valueNode.textContent || "").trim() : "";
  if (!text) {
    return "";
  }
  if (cellType === "s") {
    const index = Number.parseInt(text, 10);
    return Number.isInteger(index) && index >= 0 && index < sharedStrings.length ? sharedStrings[index].trim() : "";
  }
  if (cellType === "b") {
    return text === "1" ? "TRUE" : "FALSE";
  }
  return text;
}

function parseSheetRows(entries, sheetPath, sharedStrings) {
  const bytes = entries.get(sheetPath);
  if (!bytes) {
    throw new Error(`Worksheet '${sheetPath}' was not found in the workbook.`);
  }

  const doc = xmlDocument(bytes);
  const rawRows = [];

  [...doc.getElementsByTagNameNS("*", "row")].forEach((rowNode, rowIndex) => {
    const valuesByCol = new Map();
    let rowNumber = Number.parseInt(rowNode.getAttribute("r") || "0", 10);

    [...rowNode.getElementsByTagNameNS("*", "c")].forEach((cell) => {
      const ref = cell.getAttribute("r") || "";
      const match = ref.match(/^([A-Z]+)(\d+)$/);
      if (!match) {
        return;
      }
      valuesByCol.set(colLettersToIndex(match[1]), cellValue(cell, sharedStrings));
    });

    if (valuesByCol.size) {
      if (!rowNumber) {
        rowNumber = rowIndex + 1;
      }
      rawRows.push([rowNumber, valuesByCol]);
    }
  });

  return rawRows;
}

function extractHeaderAndRecords(rawRows) {
  if (!rawRows.length) {
    return { headers: [], records: [], rowNumbers: [], rowCells: [], headerCells: {} };
  }

  const [headerRowNumber, headerValues] = rawRows[0];
  const maxCol = Math.max(...headerValues.keys());
  const headers = [];
  const headerCells = {};

  for (let columnIndex = 0; columnIndex <= maxCol; columnIndex += 1) {
    const text = normalizeString(headerValues.get(columnIndex));
    headers.push(text);
    if (text) {
      headerCells[text] = `${indexToCol(columnIndex)}${headerRowNumber}`;
    }
  }

  const records = [];
  const rowNumbers = [];
  const rowCells = [];

  rawRows.slice(1).forEach(([rowNumber, values]) => {
    const row = {};
    const cellMap = {};
    headers.forEach((header, columnIndex) => {
      if (!header) {
        return;
      }
      const value = normalizeString(values.get(columnIndex));
      row[header] = value;
      cellMap[header] = `${indexToCol(columnIndex)}${rowNumber}`;
    });

    if (Object.values(row).some(Boolean)) {
      records.push(row);
      rowNumbers.push(rowNumber);
      rowCells.push(cellMap);
    }
  });

  return { headers, records, rowNumbers, rowCells, headerCells };
}

async function parseXlsxRows(file, preferredSheetName = "") {
  const entries = await unzipEntries(await file.arrayBuffer());
  const sheets = parseWorkbookSheets(entries);
  if (!sheets.length) {
    throw new Error("No sheets found in workbook.");
  }

  let selectedSheet = sheets[0];
  if (normalizeString(preferredSheetName)) {
    const found = sheets.find((sheet) => sheet.name.toLowerCase() === preferredSheetName.toLowerCase());
    if (found) {
      selectedSheet = found;
    }
  }

  const sharedStrings = parseSharedStrings(entries);
  const rawRows = parseSheetRows(entries, selectedSheet.target, sharedStrings);
  const extracted = extractHeaderAndRecords(rawRows);

  return {
    sheetName: selectedSheet.name,
    headers: extracted.headers,
    rows: extracted.records,
    rowNumbers: extracted.rowNumbers,
    rowCells: extracted.rowCells,
    headerCells: extracted.headerCells,
  };
}

async function convertBulk() {
  const fileInput = byId("bulk-file");
  const file = fileInput.files && fileInput.files[0];
  if (!file) {
    setStatus("Choose a .xlsx file first.", "error");
    return;
  }

  const documentName = normalizeString(byId("bulk-name").value || "Axinom Bulk Ingest");
  const nameError = formatDocumentNameError(documentName);
  if (nameError) {
    setStatus(nameError, "error");
    return;
  }

  setStatus("Converting workbook to ingest JSON...");

  try {
    const parsed = await parseXlsxRows(file, normalizeString(byId("bulk-sheet").value));
    const result = rowsToDocument({
      rows: parsed.rows,
      documentName,
      sourceName: file.name || "upload.xlsx",
      sheetName: parsed.sheetName,
      documentDescription: normalizeString(byId("bulk-description").value),
      rowNumbers: parsed.rowNumbers,
      rowCells: parsed.rowCells,
    });

    if (result.document) {
      updateAllDocumentMetaDisplays(result.document);
      renderDocument(result.document);
      setCurrentDownloadName(result.document.name || documentName);
    }

    if (!result.ok) {
      setStatus(formatErrors(result), "error");
      return;
    }

    const summary = `Converted ${result.stats.items_created || 0} item(s) from ${result.stats.rows_read || 0} row(s) on sheet '${result.stats.sheet || ""}'.`;
    if (result.warnings.length) {
      setStatus(`${summary} Warning(s): ${result.warnings.join(" | ")}`, "warn");
      return;
    }
    setStatus(summary, "ok");
  } catch (error) {
    setStatus(`Excel conversion failed: ${error.message}`, "error");
  }
}

function bindEvents() {
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".country-picker")) {
      closeOpenCountryPickers();
    }
  });

  document.addEventListener("focusin", (event) => {
    if (!event.target.closest(".country-picker")) {
      closeOpenCountryPickers();
    }
  });

  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tabTarget));
  });

  byId("theme-toggle").addEventListener("click", toggleTheme);

  byId("field-program_type").addEventListener("change", () => {
    updateRequiredHint();
    updateVisibleFields();
    syncSingleDocumentMetadata();
  });
  byId("single-ingest-mode").addEventListener("change", () => {
    updateRequiredHint();
    updateVisibleFields();
  });

  ["field-title", "field-index", "field-parent_external_id", "field-external_id"].forEach((id) => {
    byId(id).addEventListener("input", () => syncSingleDocumentMetadata());
  });

  byId("single-name").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    state.singleNameDirty = Boolean(normalizeString(byId("single-name").value));
    if (!state.singleNameDirty) {
      syncSingleDocumentMetadata();
    }
    setCurrentDownloadName(byId("single-name").value || "axinom-ingest");
  });

  byId("single-description").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    state.singleDescriptionDirty = Boolean(normalizeString(byId("single-description").value));
    if (!state.singleDescriptionDirty) {
      syncSingleDocumentMetadata();
    }
  });

  byId("bulk-name").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    state.bulkNameDirty = Boolean(normalizeString(byId("bulk-name").value));
  });

  byId("bulk-description").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    state.bulkDescriptionDirty = Boolean(normalizeString(byId("bulk-description").value));
  });

  byId("bulk-file").addEventListener("change", () => {
    void syncBulkDocumentMetadata();
  });

  byId("bulk-sheet").addEventListener("input", () => {
    void syncBulkDocumentMetadata();
  });

  byId("direct-name").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    state.directNameDirty = Boolean(normalizeString(byId("direct-name").value));
  });

  byId("direct-description").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    state.directDescriptionDirty = Boolean(normalizeString(byId("direct-description").value));
  });

  byId("build-single").addEventListener("click", generateSingle);
  byId("clear-single").addEventListener("click", clearSingle);
  byId("convert-bulk").addEventListener("click", () => { void convertBulk(); });
  byId("download-template-bulk").addEventListener("click", () => renderTemplateDownload(byId("bulk-template-version").value));
  byId("add-direct-row").addEventListener("click", () => appendDirectRow());
  byId("clear-direct-rows").addEventListener("click", clearDirectRows);
  byId("convert-direct").addEventListener("click", convertDirectRows);
  byId("download-template-direct").addEventListener("click", () => renderTemplateDownload(byId("direct-template-version").value));
  byId("copy-json").addEventListener("click", copyOutput);
  byId("download-json").addEventListener("click", downloadOutput);

  bindDefaultDateTimeLocalTime(byId("field-license_start"), 21, 0);
  bindDefaultDateTimeLocalTime(byId("field-license_end"), 23, 59);
}

function init() {
  const releaseEl = byId("app-release");
  if (releaseEl) {
    releaseEl.textContent = APP_RELEASE_LABEL;
  }

  applyTheme(resolveInitialTheme());
  renderDataList("video-profile-list", VIDEO_PROFILES);
  renderDataList("country-code-list", COMMON_COUNTRY_CODES);
  buildDirectTable();
  bindEvents();
  updateAllDocumentMetaDisplays();
  syncSingleDocumentMetadata(true);
  void syncBulkDocumentMetadata(true);
  syncDirectDocumentMetadata(true);
  updateRequiredHint();
  updateVisibleFields();
  renderDocument(null);
  setStatus("Ready.");
}

init();
