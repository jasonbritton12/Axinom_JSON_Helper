const state = {
  requiredFields: {},
  parentTypeOptions: {},
  programTypes: ["MOVIE", "TVSHOW", "SEASON", "EPISODE", "TRAILER", "EXTRA"],
  currentJson: '{\n  "name": "Axinom Ingest",\n  "items": []\n}',
  currentDownloadName: "axinom-ingest",
  theme: "dark",
  helperVersion: "",
  configLoaded: false,
  singleNameDirty: false,
  singleDescriptionDirty: false,
  autoSyncingDocumentMetadata: false,
  runtimeMode: "unknown",
  runtimeConnected: null,
  runtimeIdleTimeoutSeconds: null,
};

const THEME_STORAGE_KEY = "axinom_ingest_theme";
const RUNTIME_MODE_STORAGE_KEY = "axinom_ingest_runtime_mode";
const VALID_THEMES = new Set(["dark", "light"]);
const HEARTBEAT_INTERVAL_MS = 15000;
const RUNTIME_POLL_INTERVAL_MS = 20000;
const DESKTOP_LAUNCH_PROTOCOL = "axinom-ingest://open";
let heartbeatTimer = null;
let runtimePollTimer = null;

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
  "trailer_source",
  "trailer_profile",
  "cover_image",
  "teaser_image",
];

const FULL_FIELD_VISIBILITY = {
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
  ]),
  TRAILER: new Set([
    "title",
    "original_title",
    "description",
    "synopsis",
    "released",
    "studio",
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
  ]),
  EXTRA: new Set([
    "title",
    "original_title",
    "description",
    "synopsis",
    "released",
    "studio",
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
    "trailer_source",
    "trailer_profile",
    "cover_image",
    "teaser_image",
  ]),
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
  "Trailer Source",
  "Trailer Profile",
];

function byId(id) {
  return document.getElementById(id);
}

function padTwoDigits(value) {
  return String(value).padStart(2, "0");
}

function withDefaultDateTimeLocalTime(value, hours, minutes) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return "";
  }

  const [datePart] = normalized.split("T");
  if (!datePart) {
    return normalized;
  }

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

function resolveInitialTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && VALID_THEMES.has(saved)) {
      return saved;
    }
  } catch (_error) {
    // Ignore localStorage errors and use default.
  }

  return "dark";
}

function applyTheme(theme) {
  const safeTheme = VALID_THEMES.has(theme) ? theme : "dark";
  state.theme = safeTheme;
  document.documentElement.setAttribute("data-theme", safeTheme);

  const toggle = byId("theme-toggle");
  if (toggle) {
    const isDark = safeTheme === "dark";
    toggle.textContent = isDark ? "Use Light Theme" : "Use Dark Theme";
    toggle.setAttribute("aria-pressed", String(isDark));
  }
}

function toggleTheme() {
  const nextTheme = state.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch (_error) {
    // Ignore localStorage errors and keep current runtime theme.
  }
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    window.clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function stopRuntimePolling() {
  if (runtimePollTimer) {
    window.clearInterval(runtimePollTimer);
    runtimePollTimer = null;
  }
}

async function refreshRuntimeStatus({ loadConfig = false, surfaceFailure = false } = {}) {
  try {
    const response = await fetch("/api/runtime", {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Runtime check failed with status ${response.status}`);
    }

    const payload = await response.json();
    state.runtimeMode = normalizeString(payload.mode) || "unknown";
    state.runtimeConnected = true;
    state.runtimeIdleTimeoutSeconds = Number.isFinite(payload.idle_timeout_seconds)
      ? payload.idle_timeout_seconds
      : null;
    rememberRuntimeMode(state.runtimeMode);
    updateRuntimeBanner({
      connected: true,
      mode: state.runtimeMode,
      idleTimeoutSeconds: state.runtimeIdleTimeoutSeconds,
    });

    if (loadConfig || !state.configLoaded) {
      await fetchConfig();
    }

    return true;
  } catch (error) {
    state.runtimeConnected = false;
    updateRuntimeBanner({
      connected: false,
      mode: state.runtimeMode || lastKnownRuntimeMode(),
      idleTimeoutSeconds: state.runtimeIdleTimeoutSeconds,
      unavailableReason: "Use Retry Connection or Relaunch Desktop App.",
    });
    if (surfaceFailure) {
      setStatus(`Connection failed: ${error.message}`, "warn");
    }
    return false;
  }
}

async function sendHeartbeat() {
  try {
    await fetch("/api/health", {
      method: "GET",
      cache: "no-store",
      keepalive: true,
    });
    if (state.runtimeConnected === false) {
      await refreshRuntimeStatus({ loadConfig: !state.configLoaded });
    }
  } catch (_error) {
    state.runtimeConnected = false;
    updateRuntimeBanner({
      connected: false,
      mode: state.runtimeMode || lastKnownRuntimeMode(),
      idleTimeoutSeconds: state.runtimeIdleTimeoutSeconds,
      unavailableReason: "The local helper stopped responding.",
    });
  }
}

function startHeartbeat() {
  stopHeartbeat();
  void sendHeartbeat();
  heartbeatTimer = window.setInterval(() => {
    void sendHeartbeat();
  }, HEARTBEAT_INTERVAL_MS);
}

function startRuntimePolling() {
  stopRuntimePolling();
  runtimePollTimer = window.setInterval(() => {
    if (document.visibilityState === "visible" || state.runtimeConnected === false) {
      void refreshRuntimeStatus({ loadConfig: !state.configLoaded });
    }
  }, RUNTIME_POLL_INTERVAL_MS);
}

async function retryRuntimeConnection() {
  setStatus("Checking helper connection...", "warn");
  const connected = await refreshRuntimeStatus({ loadConfig: true, surfaceFailure: true });
  if (connected) {
    setStatus("Connection restored.", "ok");
  }
}

function relaunchDesktopApp() {
  setStatus("Launch request sent to the desktop app.", "warn");
  window.location.href = DESKTOP_LAUNCH_PROTOCOL;
  window.setTimeout(() => {
    void refreshRuntimeStatus({ loadConfig: true });
  }, 2500);
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  try {
    await navigator.serviceWorker.register("/service-worker.js");
  } catch (_error) {
    // Ignore registration errors; the app still works without offline shell support.
  }
}

function setStatus(message, kind = "") {
  const status = byId("status");
  status.textContent = message;
  status.className = "status" + (kind ? ` ${kind}` : "");
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

function formatHelperVersion(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return "Loading...";
  }
  if (normalized.toLowerCase() === "loading") {
    return "Loading...";
  }
  return normalized.startsWith("v") ? normalized : `v${normalized}`;
}

function rememberRuntimeMode(mode) {
  if (!normalizeString(mode)) {
    return;
  }
  try {
    window.localStorage.setItem(RUNTIME_MODE_STORAGE_KEY, mode);
  } catch (_error) {
    // Ignore localStorage errors and continue in-memory only.
  }
}

function lastKnownRuntimeMode() {
  try {
    return normalizeString(window.localStorage.getItem(RUNTIME_MODE_STORAGE_KEY)) || "unknown";
  } catch (_error) {
    return "unknown";
  }
}

function formatDurationLabel(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }
  if (seconds >= 3600) {
    const hours = Math.round((seconds / 3600) * 10) / 10;
    return `${hours}h`;
  }
  if (seconds >= 60) {
    return `${Math.round(seconds / 60)}m`;
  }
  return `${seconds}s`;
}

function updateRuntimeBanner({ connected, mode = "unknown", idleTimeoutSeconds = null, unavailableReason = "" } = {}) {
  const runtimeBar = byId("runtime-bar");
  const runtimeState = byId("runtime-state");
  const relaunchButton = byId("runtime-relaunch");
  if (!runtimeBar || !runtimeState || !relaunchButton) {
    return;
  }

  runtimeBar.classList.toggle("is-ok", Boolean(connected));
  runtimeBar.classList.toggle("is-error", connected === false);

  const effectiveMode = normalizeString(mode) || state.runtimeMode || lastKnownRuntimeMode();
  const modeLabel = effectiveMode === "desktop" ? "Desktop App" : effectiveMode === "web" ? "Web App" : "Helper";
  const idleLabel = formatDurationLabel(idleTimeoutSeconds);

  if (connected) {
    runtimeState.textContent = effectiveMode === "desktop" && idleLabel
      ? `${modeLabel} connected. Idle shutdown after about ${idleLabel} of inactivity.`
      : `${modeLabel} connected.`;
  } else if (connected === false) {
    runtimeState.textContent = unavailableReason
      ? `${modeLabel} unavailable. ${unavailableReason}`
      : `${modeLabel} unavailable. Retry the connection or relaunch the desktop app.`;
  } else {
    runtimeState.textContent = "Checking app status...";
  }

  const showRelaunch = effectiveMode === "desktop" || (effectiveMode === "unknown" && lastKnownRuntimeMode() === "desktop");
  relaunchButton.hidden = !showRelaunch;
}

function updateDocumentMetaDisplay(prefix, createdValue = "") {
  const createdEl = byId(`${prefix}-document-created-display`);
  if (!createdEl) {
    return;
  }

  const displayValue = createdValue || "Auto-stamped when JSON is generated";
  if ("value" in createdEl) {
    createdEl.value = displayValue;
    return;
  }

  createdEl.textContent = displayValue;
}

function updateAllDocumentMetaDisplays(document = null) {
  const createdValue = normalizeString(document?.document_created);
  ["single", "bulk", "direct"].forEach((prefix) => {
    updateDocumentMetaDisplay(prefix, createdValue);
  });
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
  if (!tokens.length) {
    return "";
  }

  return tokens
    .map((token) => {
      if (/^\d+$/.test(token)) {
        return token;
      }
      if (token === token.toUpperCase() && token.length <= 4) {
        return token;
      }
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join(" ");
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

function singleDocumentSubject() {
  const programType = byId("field-program_type").value;
  const title = readInputValue(byId("field-title"));
  const externalId = readInputValue(byId("field-external_id"));
  const parentExternalId = readInputValue(byId("field-parent_external_id"));

  if (programType === "MOVIE") {
    return title || humanizeIdentifier(externalId) || "Movie";
  }

  if (programType === "TVSHOW") {
    return title || humanizeIdentifier(externalId) || "Series";
  }

  if (programType === "SEASON") {
    return humanizeIdentifier(parentExternalId) || title || humanizeIdentifier(externalId) || "Series";
  }

  if (programType === "EPISODE") {
    return humanizeIdentifier(stripSeasonSuffix(parentExternalId) || parentExternalId) || title || humanizeIdentifier(externalId) || "Series";
  }

  if (programType === "TRAILER" || programType === "EXTRA") {
    return title || humanizeIdentifier(parentExternalId) || humanizeIdentifier(externalId) || programType;
  }

  return title || humanizeIdentifier(externalId) || "Axinom Ingest";
}

function suggestSingleDocumentMetadata() {
  const programType = byId("field-program_type").value;
  const subject = singleDocumentSubject();
  const index = padIndexLabel(readInputValue(byId("field-index")));
  const seasonIndex = extractSeasonIndex(readInputValue(byId("field-parent_external_id")));

  if (programType === "MOVIE") {
    return {
      name: `${subject} - Movie Ingest`,
      description: `Single-item movie ingest for ${subject}.`,
    };
  }

  if (programType === "TVSHOW") {
    return {
      name: `${subject} - TV Show Ingest`,
      description: `Single-item TV show ingest for ${subject}.`,
    };
  }

  if (programType === "SEASON") {
    return {
      name: `${subject} - ${index ? `S${index}` : "Season"} Ingest`,
      description: `Single-item season ingest for ${subject}${index ? ` season ${index}` : ""}.`,
    };
  }

  if (programType === "EPISODE") {
    let episodeLabel = "Episode";
    let description = `Single-item episode ingest for ${subject}.`;
    if (seasonIndex && index) {
      episodeLabel = `S${seasonIndex} E${index}`;
      description = `Single-item episode ingest for ${subject}, season ${seasonIndex} episode ${index}.`;
    } else if (index) {
      episodeLabel = `Episode ${index}`;
      description = `Single-item episode ingest for ${subject}, episode ${index}.`;
    }
    return {
      name: `${subject} - ${episodeLabel} Ingest`,
      description,
    };
  }

  if (programType === "TRAILER") {
    return {
      name: `${subject} - Trailer Ingest`,
      description: `Single-item trailer ingest for ${subject}.`,
    };
  }

  if (programType === "EXTRA") {
    return {
      name: `${subject} - Extra Ingest`,
      description: `Single-item extra ingest for ${subject}.`,
    };
  }

  return {
    name: `${subject} - Ingest`,
    description: `Single-item ingest for ${subject}.`,
  };
}

function syncSingleDocumentMetadata(force = false) {
  const nameInput = byId("single-name");
  const descriptionInput = byId("single-description");
  if (!nameInput || !descriptionInput) {
    return;
  }

  const suggestions = suggestSingleDocumentMetadata();
  state.autoSyncingDocumentMetadata = true;
  if (force || !state.singleNameDirty || !normalizeString(nameInput.value)) {
    nameInput.value = suggestions.name;
    if (!force && !normalizeString(nameInput.value)) {
      state.singleNameDirty = false;
    }
  }
  if (force || !state.singleDescriptionDirty || !normalizeString(descriptionInput.value)) {
    descriptionInput.value = suggestions.description;
    if (!force && !normalizeString(descriptionInput.value)) {
      state.singleDescriptionDirty = false;
    }
  }
  state.autoSyncingDocumentMetadata = false;
  if (force) {
    state.singleNameDirty = false;
    state.singleDescriptionDirty = false;
  }
  setCurrentDownloadName(nameInput.value || "axinom-ingest");
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
          const detailsList = Array.isArray(entry.errors)
            ? entry.errors.map((value) => String(value || "")).filter(Boolean)
            : [];
          const details = detailsList.length
            ? detailsList.join(" | ")
            : String(entry.errors || "Unknown error");
          if (/^Error at /i.test(details)) {
            return details;
          }
          const row = entry.row ? `Row ${entry.row}` : "File";
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

function currentSingleIngestMode() {
  return (byId("single-ingest-mode")?.value || "SIMPLE").toUpperCase();
}

function allowedParentTypesFor(programType) {
  return state.parentTypeOptions[programType] || [];
}

function requiredFieldsForSingle(programType, ingestMode) {
  const required = new Set([...(state.requiredFields[programType] || []), "program_type"]);
  if (ingestMode === "SIMPLE" && SIMPLE_VIDEO_REQUIRED_TYPES.has(programType)) {
    required.add("video_source");
    required.add("video_profile");
  }
  return required;
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

function updateSingleParentTypeOptions() {
  const programType = byId("field-program_type").value;
  populateSingleSelect(byId("field-parent_type"), allowedParentTypesFor(programType));
}

function updateRequiredHint() {
  const programType = byId("field-program_type").value;
  updateIndexFieldLabel(programType);
  const ingestMode = currentSingleIngestMode();
  const required = [...requiredFieldsForSingle(programType, ingestMode)].filter((field) => field !== "program_type");
  const requiredLabels = required.map((field) => singleFieldLabel(field));
  const requiredBox = byId("required-fields");
  requiredBox.textContent = requiredLabels.length
    ? `Required for ${programType} (${ingestMode === "FULL" ? "Full" : "Simple"}): ${requiredLabels.join(", ")}`
    : `No required field metadata found for ${programType}.`;

  updateRequiredFieldStyles();
}

function updateRequiredFieldStyles() {
  const programType = byId("field-program_type").value;
  const required = requiredFieldsForSingle(programType, currentSingleIngestMode());

  document.querySelectorAll("#tab-single label[data-field]").forEach((label) => {
    const field = label.dataset.field;
    label.classList.toggle("is-required", required.has(field));
  });
}

function updateVisibleFields() {
  const programType = byId("field-program_type").value;
  updateIndexFieldLabel(programType);
  updateSingleParentTypeOptions();
  const ingestMode = currentSingleIngestMode();
  const visibilityMap = ingestMode === "FULL" ? FULL_FIELD_VISIBILITY : SIMPLE_FIELD_VISIBILITY;
  const visible = visibilityMap[programType] || visibilityMap.MOVIE;

  document.querySelectorAll("#single-fields-grid [data-field]").forEach((el) => {
    const field = el.dataset.field;
    const shouldShow = visible.has(field);
    el.classList.toggle("hidden-field", !shouldShow);
  });

  updateRequiredFieldStyles();
}

function readInputValue(el) {
  if (!el) {
    return "";
  }

  if (el instanceof HTMLSelectElement && el.multiple) {
    return [...el.selectedOptions]
      .map((option) => option.value.trim())
      .filter(Boolean)
      .join(", ");
  }

  return typeof el.value === "string" ? el.value.trim() : "";
}

function collectSinglePayload() {
  const fields = {};
  for (const fieldId of singleFieldIds) {
    const el = byId(`field-${fieldId}`);
    fields[fieldId] = readInputValue(el);
  }

  return {
    name: readInputValue(byId("single-name")),
    description: readInputValue(byId("single-description")),
    ingest_mode: currentSingleIngestMode(),
    fields,
  };
}

function validateSinglePayload(payload) {
  const programType = payload?.fields?.program_type || byId("field-program_type").value;
  const required = requiredFieldsForSingle(programType, currentSingleIngestMode());
  const missingLabels = [];

  required.forEach((fieldId) => {
    if (fieldId === "program_type") {
      return;
    }
    const value = normalizeString(payload?.fields?.[fieldId]);
    if (!value) {
      missingLabels.push(singleFieldLabel(fieldId));
    }
  });

  if (!missingLabels.length) {
    return "";
  }

  return `Missing required fields: ${missingLabels.join(", ")}`;
}

async function generateSingle() {
  const payload = collectSinglePayload();
  const validationMessage = validateSinglePayload(payload);
  if (validationMessage) {
    setStatus(validationMessage, "error");
    return;
  }

  setStatus("Generating JSON for single item...");

  const response = await fetch("/api/single", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (result.document) {
    updateAllDocumentMetaDisplays(result.document);
    setCurrentDownloadName(result.document.name);
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
    updateAllDocumentMetaDisplays(result.document);
    setCurrentDownloadName(result.document.name || byId("bulk-name").value || "axinom-bulk-ingest");
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
    return { kind: "program-type-select" };
  }

  if (columnName === "Parent Type") {
    return { kind: "parent-type-select" };
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

  return { kind: "input", type: "text" };
}

function createCellInput(columnName, initialValue = "") {
  const config = directInputConfig(columnName);

  if (config.kind === "program-type-select") {
    const select = document.createElement("select");
    populateSingleSelect(select, state.programTypes, initialValue);
    return select;
  }

  if (config.kind === "parent-type-select") {
    const select = document.createElement("select");
    populateSingleSelect(select, [], initialValue);
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

  if (columnName === "License Start (UTC)") {
    bindDefaultDateTimeLocalTime(input, 21, 0);
  } else if (columnName === "License End (UTC)") {
    bindDefaultDateTimeLocalTime(input, 23, 59);
  }

  return input;
}

function directColumnKey(columnName) {
  return columnName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function directRowInput(row, columnName) {
  return row.querySelector(`[data-column-key="${directColumnKey(columnName)}"]`);
}

function updateDirectParentTypeOptions(row, preferredValue = "") {
  const assetTypeInput = directRowInput(row, "Asset Type");
  const parentTypeInput = directRowInput(row, "Parent Type");
  if (!assetTypeInput || !parentTypeInput) {
    return;
  }

  populateSingleSelect(parentTypeInput, allowedParentTypesFor(assetTypeInput.value), preferredValue || parentTypeInput.value);
}

function refreshDirectProgramTypeOptions() {
  const rows = byId("direct-table").querySelectorAll("tbody tr");
  rows.forEach((row) => {
    const assetTypeInput = directRowInput(row, "Asset Type");
    if (assetTypeInput) {
      populateSingleSelect(assetTypeInput, state.programTypes, assetTypeInput.value);
    }
    updateDirectParentTypeOptions(row);
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
    input.dataset.columnKey = directColumnKey(column);
    if (column === "Asset Type") {
      input.addEventListener("change", () => {
        updateDirectParentTypeOptions(row);
      });
    }
    cell.appendChild(input);
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
      source: "direct-sheet",
      sheet_name: "Direct Entry",
      rows,
    }),
  });

  const result = await response.json();

  if (result.document) {
    updateAllDocumentMetaDisplays(result.document);
    setCurrentDownloadName(result.document.name || byId("direct-name").value || "axinom-direct-sheet-ingest");
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
  byId("single-ingest-mode").value = "SIMPLE";
  state.singleNameDirty = false;
  state.singleDescriptionDirty = false;
  byId("single-description").value = "";

  for (const fieldId of singleFieldIds) {
    const el = byId(`field-${fieldId}`);
    if (!el) {
      continue;
    }

    if (fieldId === "program_type") {
      el.value = "MOVIE";
    } else if (el instanceof HTMLSelectElement && el.multiple) {
      [...el.options].forEach((option) => {
        option.selected = false;
      });
    } else {
      el.value = "";
    }
  }

  updateAllDocumentMetaDisplays();
  syncSingleDocumentMetadata(true);
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
  link.download = `${state.currentDownloadName || "axinom-ingest"}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderDataList(listId, values) {
  const list = byId(listId);
  if (!list) {
    return;
  }

  list.innerHTML = "";
  if (!Array.isArray(values) || !values.length) {
    return;
  }

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    list.appendChild(option);
  });
}

function renderSelectOptions(selectId, values) {
  const select = byId(selectId);
  if (!select) {
    return;
  }

  const current = new Set(
    [...select.selectedOptions]
      .map((option) => normalizeString(option.value))
      .filter(Boolean),
  );

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

async function fetchConfig() {
  const configResponse = await fetch("/api/config");
  if (!configResponse.ok) {
    throw new Error(`Config request failed with status ${configResponse.status}`);
  }
  const configPayload = await configResponse.json();
  state.requiredFields = configPayload.required_fields || {};
  state.parentTypeOptions = configPayload.allowed_parent_types || {};
  state.programTypes = configPayload.program_types || state.programTypes;
  state.helperVersion = formatHelperVersion(configPayload.helper_version || configPayload.app_release_label);
  state.configLoaded = true;
  if (configPayload.app_release_label) {
    const releaseEl = byId("app-release");
    if (releaseEl) {
      releaseEl.textContent = configPayload.app_release_label;
    }
  }

  const picklistResponse = await fetch("/api/picklists");
  if (!picklistResponse.ok) {
    throw new Error(`Picklist request failed with status ${picklistResponse.status}`);
  }
  const picklistPayload = await picklistResponse.json();

  renderDataList("video-profile-list", picklistPayload.video_profiles || []);
  renderDataList("country-code-list", picklistPayload.common_country_codes || []);
  renderSelectOptions("field-production_countries", picklistPayload.common_country_codes || []);
  renderSelectOptions("field-license_countries", picklistPayload.common_country_codes || []);
  refreshDirectProgramTypeOptions();

  updateAllDocumentMetaDisplays();
  syncSingleDocumentMetadata();
  updateRequiredHint();
  updateVisibleFields();
}

function bindEvents() {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tabTarget));
  });

  byId("theme-toggle").addEventListener("click", toggleTheme);
  byId("runtime-retry").addEventListener("click", () => {
    void retryRuntimeConnection();
  });
  byId("runtime-relaunch").addEventListener("click", relaunchDesktopApp);

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
    byId(id).addEventListener("input", () => {
      syncSingleDocumentMetadata();
    });
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
  window.addEventListener("beforeunload", () => {
    stopHeartbeat();
    stopRuntimePolling();
  });
  window.addEventListener("focus", () => {
    void refreshRuntimeStatus({ loadConfig: !state.configLoaded });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void sendHeartbeat();
      void refreshRuntimeStatus({ loadConfig: !state.configLoaded });
    }
  });

  bindDefaultDateTimeLocalTime(byId("field-license_start"), 21, 0);
  bindDefaultDateTimeLocalTime(byId("field-license_end"), 23, 59);
}

async function init() {
  applyTheme(resolveInitialTheme());
  ensureLabelTextSpans();
  bindEvents();
  buildDirectTable();
  updateAllDocumentMetaDisplays();
  syncSingleDocumentMetadata(true);
  setCurrentDownloadName(byId("single-name").value || "Axinom Ingest");
  renderJson(state.currentJson);
  void registerServiceWorker();
  startHeartbeat();
  startRuntimePolling();

  const connected = await refreshRuntimeStatus({ loadConfig: true });
  if (!connected) {
    setStatus("Helper runtime unavailable. Retry the connection or relaunch the desktop app.", "warn");
  }
}

init().catch((error) => {
  setStatus(`Initialization failed: ${error.message}`, "error");
});
