const APP_RELEASE_LABEL = "v2.2.0";
const HELPER_VERSION = "v2.2.0";
const DOCUMENT_NAME_MAX_LENGTH = 50;
const DESCRIPTION_WARN_LENGTH = 150;
const THEME_STORAGE_KEY = "axinom_ingest_theme";
const MAX_WORKBOOK_BYTES = 10 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 300;
const MAX_ZIP_ENTRY_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_UNCOMPRESSED_BYTES = 25 * 1024 * 1024;
const MAX_WARNING_CATEGORIES = 12;
const MAX_WARNING_REPRESENTATIVES = 3;
const MAX_DETAILED_ISSUES = 50;
const MAX_ISSUE_MESSAGE_LENGTH = 240;
const MAX_STATUS_MESSAGE_LENGTH = 2000;

const PROGRAM_TYPES = ["MOVIE", "TVSHOW", "SEASON", "EPISODE", "PODCAST", "PODCAST_SEASON", "PODCAST_EPISODE", "TRAILER", "EXTRA"];
const EXPERIMENTAL_PROGRAM_TYPES = new Set(["PODCAST", "PODCAST_SEASON", "PODCAST_EPISODE"]);
const AXINOM_CONFIRMED_INGEST_TYPES = new Set(["MOVIE", "TVSHOW", "SEASON", "EPISODE", "TRAILER", "EXTRA"]);
const DEFAULT_VIDEO_PROFILE = "HLS-DASH_Non-DRM";
const ACTIVE_VIDEO_PROFILES = [
  DEFAULT_VIDEO_PROFILE,
  "HLS-DASH_DRM",
  "LAS_HLS-DASH_Non-DRM",
  "LAS_HLS-DASH_DRM",
];
const LEGACY_VIDEO_PROFILES = new Set(["LAS_CMAF_File_Non-DRM", "CMAF_File_Non-DRM", "CMAF_File_DRM", "CMAF_File_Non-DRM_SD", "CMAF_File_DRM_SD", "DEFAULT", "nDRM (HLS)", "DRM (DASH & HLS)", "nDRM (HLS-Only) HD", "DRM (HLS+Dash) HD", "nDRM (HLS-Only) SD", "DRM (HLS+Dash) SD"]);
const VIDEO_PROFILES = ACTIVE_VIDEO_PROFILES;
const VIDEO_BEARING_TYPES = new Set(["MOVIE", "EPISODE", "PODCAST_EPISODE", "TRAILER", "EXTRA"]);
const COMMON_COUNTRY_CODES = ["US", "CA"];
const TEMPLATE_FILES = {
  latest: "docs/reference/axinom_ingest_template_v2_2_0.xlsx",
  current: "docs/reference/axinom_ingest_template_v2_2_0.xlsx",
};

const PROGRAM_TYPE_CONFIG = {
  MOVIE: { ingestType: "MOVIE", required: ["external_id", "title"], allowedParentTypes: [] },
  TVSHOW: { ingestType: "TVSHOW", required: ["external_id", "title"], allowedParentTypes: [] },
  PODCAST: { ingestType: "PODCAST", required: ["external_id", "title"], allowedParentTypes: [] },
  SEASON: { ingestType: "SEASON", required: ["external_id", "index", "parent_external_id"], allowedParentTypes: ["TVSHOW"] },
  EPISODE: { ingestType: "EPISODE", required: ["external_id", "title", "index", "parent_external_id"], allowedParentTypes: ["SEASON"] },
  PODCAST_SEASON: { ingestType: "PODCAST_SEASON", required: ["external_id", "index", "parent_external_id"], allowedParentTypes: ["PODCAST"] },
  PODCAST_EPISODE: { ingestType: "PODCAST_EPISODE", required: ["external_id", "title", "index", "parent_external_id"], allowedParentTypes: ["PODCAST_SEASON"] },
  TRAILER: { ingestType: "TRAILER", required: ["external_id", "title", "parent_type", "parent_external_id"], allowedParentTypes: ["MOVIE", "TVSHOW", "PODCAST", "SEASON", "EPISODE", "PODCAST_SEASON", "PODCAST_EPISODE", "EXTRA"] },
  EXTRA: { ingestType: "EXTRA", required: ["external_id", "title", "parent_type", "parent_external_id"], allowedParentTypes: ["MOVIE", "TVSHOW", "PODCAST"] },
};

const TYPE_ALIASES = {
  MOVIE: "MOVIE",
  TVSHOW: "TVSHOW",
  PODCAST: "PODCAST",
  PODCASTS: "PODCAST",
  PODCASTSEASON: "PODCAST_SEASON",
  "PODCAST SEASON": "PODCAST_SEASON",
  "PODCAST-SEASON": "PODCAST_SEASON",
  PODCASTSEASONS: "PODCAST_SEASON",
  PODCASTEPISODE: "PODCAST_EPISODE",
  "PODCAST EPISODE": "PODCAST_EPISODE",
  "PODCAST-EPISODE": "PODCAST_EPISODE",
  PODCASTEPISODES: "PODCAST_EPISODE",
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
  TVSHOW: new Set(["title", "original_title", "description", "synopsis", "released", "studio", "series_hint", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "cover_image", "teaser_image"]),
  PODCAST: new Set(["title", "original_title", "description", "synopsis", "released", "studio", "series_hint", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "cover_image", "teaser_image"]),
  SEASON: new Set(["description", "synopsis", "released", "studio", "series_hint", "season_index", "parent_external_id", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "cover_image", "teaser_image"]),
  EPISODE: new Set(["title", "original_title", "description", "synopsis", "released", "studio", "series_hint", "season_index", "episode_index", "parent_external_id", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "video_source", "video_profile", "cover_image", "teaser_image"]),
  PODCAST_SEASON: new Set(["description", "synopsis", "released", "studio", "series_hint", "season_index", "parent_external_id", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "cover_image", "teaser_image"]),
  PODCAST_EPISODE: new Set(["title", "original_title", "description", "synopsis", "released", "studio", "series_hint", "season_index", "episode_index", "parent_external_id", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "video_source", "video_profile", "cover_image", "teaser_image"]),
  TRAILER: new Set(["title", "original_title", "description", "synopsis", "released", "studio", "parent_type", "parent_external_id", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "video_source", "video_profile", "cover_image", "teaser_image"]),
  EXTRA: new Set(["title", "original_title", "description", "synopsis", "released", "studio", "parent_type", "parent_external_id", "genres", "tags", "cast", "production_countries", "license_start", "license_end", "license_countries", "video_source", "video_profile", "cover_image", "teaser_image"]),
};

const SIMPLE_FIELD_VISIBILITY = {
  MOVIE: new Set(["title", "studio", "video_source", "video_profile"]),
  TVSHOW: new Set(["title", "series_hint", "studio"]),
  PODCAST: new Set(["title", "series_hint", "studio"]),
  SEASON: new Set(["series_hint", "season_index", "studio", "parent_external_id"]),
  EPISODE: new Set(["title", "series_hint", "season_index", "episode_index", "studio", "parent_external_id", "video_source", "video_profile"]),
  PODCAST_SEASON: new Set(["series_hint", "season_index", "studio", "parent_external_id"]),
  PODCAST_EPISODE: new Set(["title", "series_hint", "season_index", "episode_index", "studio", "parent_external_id", "video_source", "video_profile"]),
  TRAILER: new Set(["title", "studio", "parent_type", "parent_external_id", "video_source", "video_profile"]),
  EXTRA: new Set(["title", "studio", "parent_type", "parent_external_id", "video_source", "video_profile"]),
};

const SIMPLE_VIDEO_REQUIRED_TYPES = VIDEO_BEARING_TYPES;

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
  provider: "provider_alias",
  contentprovider: "provider_alias",
  seasonepnumber: "legacy_index",
  seasonepisodeindex: "legacy_index",
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
  languagetag: "language_tag",
  language: "language_tag",
  localizedtitle: "localized_title",
  localizeddescription: "localized_description",
  localizedsynopsis: "localized_synopsis",
  trailersource: "trailer_source",
  trailerprofile: "trailer_profile",
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
  "Series",
  "Season Number",
  "Episode Number",
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
  "series_hint",
  "season_index",
  "episode_index",
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
  currentDocumentSource: "",
  currentJson: '{\n  "name": "AxinomIngest",\n  "items": []\n}',
  currentDownloadName: "AxinomIngest",
  theme: "dark",
  singleNameDirty: false,
  singleDescriptionDirty: false,
  bulkNameDirty: false,
  bulkDescriptionDirty: false,
  directNameDirty: false,
  directDescriptionDirty: false,
  autoSyncingDocumentMetadata: false,
  bulkPreviewRequestId: 0,
  singleLastGeneratedId: "",
  singleLastGeneratedParentId: "",
};

function byId(id) {
  return document.getElementById(id);
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : String(value || "").trim();
}

function normalizeGuidComponent(value) {
  return normalizeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s&-]/g, "")
    .replace(/([a-z0-9])&([a-z0-9])/g, "$1$2")
    .replace(/[&-]/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

function resolveStudioProvider(fields = {}, sourceCells = {}) {
  const studio = normalizeString(fields.studio);
  const provider = normalizeString(fields.provider_alias || fields.provider);
  const normalizedStudio = normalizeGuidComponent(studio);
  const normalizedProvider = normalizeGuidComponent(provider);
  const warnings = [];
  if (studio && provider && normalizedStudio !== normalizedProvider) {
    const studioCell = sourceCells.studio ? ` (${sourceCells.studio})` : "";
    const providerCell = sourceCells.provider_alias || sourceCells.provider ? ` (${sourceCells.provider_alias || sourceCells.provider})` : "";
    warnings.push(`Studio '${studio}'${studioCell} conflicts with Provider '${provider}'${providerCell}; Studio was used.`);
  }
  return { value: studio || provider, source: studio ? "studio" : (provider ? "provider" : ""), warnings };
}

function resolveIndexFields(fields = {}, sourceCells = {}) {
  const type = normalizeProgramType(fields.program_type);
  const explicitField = ["SEASON", "PODCAST_SEASON"].includes(type) ? "season_index" : "episode_index";
  const explicit = normalizeString(fields[explicitField]);
  const legacy = normalizeString(fields.legacy_index || fields.index);
  const warnings = [];
  if (explicit && legacy && Number(explicit) !== Number(legacy)) {
    const explicitCell = sourceCells[explicitField] || explicitField;
    const legacyCell = sourceCells.legacy_index || sourceCells.index || "legacy index";
    warnings.push(`${explicitCell} '${explicit}' conflicts with ${legacyCell} '${legacy}'; ${explicitField} was used.`);
  }
  return { value: explicit || legacy, source: explicit ? explicitField : (legacy ? "legacy_index" : ""), warnings };
}

function generationInputs(fields, programType) {
  const studio = resolveStudioProvider(fields);
  const indices = resolveIndexFields({ ...fields, program_type: programType });
  const series = normalizeString(fields.series_hint);
  const title = normalizeString(fields.title);
  const season = normalizeString(fields.season_index || (["SEASON", "PODCAST_SEASON"].includes(programType) ? indices.value : fields.season_index));
  const episode = normalizeString(fields.episode_index || (["EPISODE", "PODCAST_EPISODE"].includes(programType) ? indices.value : fields.episode_index));
  return { studio, series, title, season, episode };
}

function generateExternalId(fields = {}) {
  const programType = normalizeProgramType(fields.program_type);
  const input = generationInputs(fields, programType);
  const missing = [];
  const warnings = [...input.studio.warnings];
  const require = (value, label) => {
    if (!normalizeString(value)) missing.push(label);
    else if (!normalizeGuidComponent(value)) missing.push(`${label} (empty after normalization)`);
  };
  const titleOrSeries = input.series || input.title;
  if (["TVSHOW", "PODCAST"].includes(programType)) require(titleOrSeries, "Series or Title");
  else if (["SEASON", "EPISODE", "PODCAST_SEASON", "PODCAST_EPISODE"].includes(programType)) require(input.series, "Series");
  else if (["MOVIE", "TRAILER", "EXTRA"].includes(programType)) require(input.title, "Title");
  require(input.studio.value, "Studio");
  if (["SEASON", "EPISODE", "PODCAST_SEASON", "PODCAST_EPISODE"].includes(programType)) require(input.season, "Season Number");
  if (["EPISODE", "PODCAST_EPISODE"].includes(programType)) require(input.episode, "Episode Number");
  if (missing.length || !PROGRAM_TYPE_CONFIG[programType]) return { ok: false, value: "", parentExternalId: "", parentType: "", missing: missing.length ? missing : ["Program Type"], warnings, sourceFields: [] };

  const root = ["PODCAST", "PODCAST_SEASON", "PODCAST_EPISODE"].includes(programType) ? "P" : "S";
  const entity = normalizeGuidComponent(["TVSHOW", "PODCAST", "SEASON", "EPISODE", "PODCAST_SEASON", "PODCAST_EPISODE"].includes(programType) ? titleOrSeries : input.title);
  const studio = normalizeGuidComponent(input.studio.value);
  const season = normalizeGuidComponent(input.season);
  const episode = normalizeGuidComponent(input.episode);
  let value = "";
  let parentExternalId = "";
  let parentType = "";
  if (["TVSHOW", "PODCAST"].includes(programType)) value = `${root}_${entity}_${studio}`;
  if (["SEASON", "PODCAST_SEASON"].includes(programType)) {
    parentExternalId = `${root}_${entity}_${studio}`;
    parentType = programType === "SEASON" ? "TVSHOW" : "PODCAST";
    value = `${parentExternalId}_S${season}`;
  }
  if (["EPISODE", "PODCAST_EPISODE"].includes(programType)) {
    const rootId = `${root}_${entity}_${studio}`;
    parentExternalId = `${rootId}_S${season}`;
    parentType = programType === "EPISODE" ? "SEASON" : "PODCAST_SEASON";
    value = `${parentExternalId}_E${episode}`;
  }
  if (programType === "MOVIE") value = `M_${entity}_${studio}`;
  if (programType === "TRAILER") value = `M_${entity}_${studio}_preview`;
  if (programType === "EXTRA") {
    value = `EX_${entity}_${studio}`;
    const suppliedParent = normalizeProgramType(fields.parent_type);
    if (input.series && ["TVSHOW", "PODCAST"].includes(suppliedParent)) {
      const extraRoot = suppliedParent === "PODCAST" ? "P" : "S";
      parentExternalId = `${extraRoot}_${normalizeGuidComponent(input.series)}_${studio}`;
      parentType = suppliedParent;
    }
  }
  return { ok: true, value, parentExternalId, parentType, missing: [], warnings, sourceFields: ["title", "series_hint", input.studio.source, "season_index", "episode_index"].filter(Boolean) };
}

function resolveExternalId(fields = {}) {
  const supplied = normalizeString(fields.external_id);
  if (supplied) return { value: supplied, source: "supplied", generatedParentExternalId: "", generatedParentType: "", missing: [], warnings: [] };
  const generated = generateExternalId(fields);
  return { value: generated.value, source: generated.ok ? "generated" : "missing", generatedParentExternalId: generated.parentExternalId, generatedParentType: generated.parentType, missing: generated.missing, warnings: generated.warnings };
}

function validateEpisodeExternalId(programType, externalId, episodeNumber) {
  if (!["EPISODE", "PODCAST_EPISODE"].includes(normalizeProgramType(programType))) return { status: "not-applicable", warning: "" };
  const episode = normalizeString(episodeNumber);
  if (!episode) return { status: "unverifiable", warning: "" };
  const suffix = normalizeString(externalId).match(/(?:_|-)E(\d+)$/i);
  if (!suffix) return { status: "unverifiable", warning: `Episode Number ${episode} could not be verified because External ID does not end with a numeric _E component.` };
  if (Number.parseInt(suffix[1], 10) === Number.parseInt(episode, 10)) return { status: "match", warning: "" };
  return { status: "mismatch", warning: `Episode Number ${episode} does not match External ID suffix E${suffix[1]}; expected an ID ending in _E${episode}.` };
}

function profileForFields(fields = {}, { surface = "single", templateVersion = "" } = {}) {
  const supplied = normalizeString(fields.video_profile);
  if (supplied) return { value: supplied, defaulted: false, preservedLegacy: LEGACY_VIDEO_PROFILES.has(supplied) };
  const type = normalizeProgramType(fields.program_type);
  if (!VIDEO_BEARING_TYPES.has(type) || !normalizeString(fields.video_source)) return { value: "", defaulted: false, preservedLegacy: false };
  const normalizedVersion = normalizeString(templateVersion).replace(/^v/i, "");
  const currentImport = surface === "bulk" && normalizedVersion === "2.2.0";
  if (surface === "single" || surface === "direct" || currentImport) return { value: DEFAULT_VIDEO_PROFILE, defaulted: true, preservedLegacy: false };
  return { value: "", defaulted: false, preservedLegacy: false };
}

function pascalCaseToken(token) {
  const clean = normalizeString(token).replace(/[^A-Za-z0-9]/g, "");
  if (!clean) {
    return "";
  }
  if (/^\d+$/.test(clean)) {
    return clean;
  }
  const indexed = clean.match(/^([A-Za-z])(\d+)$/);
  if (indexed) {
    return `${indexed[1].toUpperCase()}${indexed[2]}`;
  }
  if (/^[A-Z0-9]+$/.test(clean) && clean.length <= 4) {
    return clean;
  }
  if (/^[A-Z0-9]+$/.test(clean)) {
    return `${clean.charAt(0).toUpperCase()}${clean.slice(1).toLowerCase()}`;
  }
  if (/[A-Z]/.test(clean.slice(1))) {
    return `${clean.charAt(0).toUpperCase()}${clean.slice(1)}`;
  }
  return `${clean.charAt(0).toUpperCase()}${clean.slice(1).toLowerCase()}`;
}

function codeSafeSection(value) {
  return normalizeString(value)
    .replace(/['`\u2018\u2019]/g, "")
    .match(/[A-Za-z0-9]+/g)
    ?.map(pascalCaseToken)
    .join("") || "";
}

function suffixSectionsFromLabel(label) {
  const tokens = normalizeString(label)
    .replace(/['`\u2018\u2019]/g, "")
    .match(/[A-Za-z0-9]+/g) || [];
  const sections = [];
  let current = "";

  tokens.forEach((token) => {
    const safeToken = pascalCaseToken(token);
    if (!safeToken) {
      return;
    }
    if (/^[A-Z]\d+$/.test(safeToken)) {
      if (current) {
        sections.push(current);
        current = "";
      }
      sections.push(safeToken);
      return;
    }
    current += safeToken;
  });

  if (current) {
    sections.push(current);
  }
  return sections;
}

function cleanNameSections(sections) {
  return (sections || [])
    .map((section) => normalizeString(section).replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean);
}

function collapseNameSeparators(value) {
  return normalizeString(value).replace(/_+/g, "_").replace(/^_+|_+$/g, "");
}

function truncateWithoutEllipsis(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, Math.max(0, maxLength));
}

function joinAndLimitDocumentNameSections(sections, fallback = "AxinomIngest") {
  const cleanSections = cleanNameSections(sections);
  if (!cleanSections.length) {
    cleanSections.push(codeSafeSection(fallback) || "AxinomIngest");
  }

  let name = collapseNameSeparators(cleanSections.join("_"));
  if (name.length <= DOCUMENT_NAME_MAX_LENGTH) {
    return name;
  }

  if (cleanSections.length === 1) {
    return truncateWithoutEllipsis(cleanSections[0], DOCUMENT_NAME_MAX_LENGTH) || "AxinomIngest";
  }

  const suffix = cleanSections.slice(1).join("_");
  const separatorLength = suffix ? 1 : 0;
  const subjectMaxLength = DOCUMENT_NAME_MAX_LENGTH - suffix.length - separatorLength;
  if (subjectMaxLength > 0) {
    const subject = truncateWithoutEllipsis(cleanSections[0], subjectMaxLength);
    return collapseNameSeparators(`${subject}_${suffix}`);
  }

  return truncateWithoutEllipsis(suffix, DOCUMENT_NAME_MAX_LENGTH) || "AxinomIngest";
}

function sanitizeDocumentName(value, fallback = "AxinomIngest") {
  const sections = normalizeString(value).split(/_+/).map(codeSafeSection).filter(Boolean);
  return joinAndLimitDocumentNameSections(sections, fallback);
}

function normalizeDocumentNameInput(input, fallback) {
  const safeName = sanitizeDocumentName(input?.value || fallback, fallback);
  if (input) {
    input.value = safeName;
  }
  return safeName;
}

function sanitizeFilenameStem(value) {
  return sanitizeDocumentName(value, "AxinomIngest");
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

function activateTab(tabId, { focus = false } = {}) {
  let activeButton = null;
  document.querySelectorAll(".tab-btn").forEach((button) => {
    const isActive = button.dataset.tabTarget === tabId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.tabIndex = isActive ? 0 : -1;
    if (isActive) {
      activeButton = button;
    }
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    const isActive = panel.id === tabId;
    panel.classList.toggle("is-active", isActive);
    panel.setAttribute("aria-hidden", isActive ? "false" : "true");
  });

  if (focus && activeButton) {
    activeButton.focus();
  }
}

function handleTabKeydown(event) {
  const tabs = [...document.querySelectorAll(".tab-btn")];
  const currentIndex = tabs.indexOf(event.currentTarget);
  if (currentIndex < 0) {
    return;
  }

  let nextIndex = currentIndex;
  if (event.key === "ArrowRight") {
    nextIndex = (currentIndex + 1) % tabs.length;
  } else if (event.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = tabs.length - 1;
  } else {
    return;
  }

  event.preventDefault();
  activateTab(tabs[nextIndex].dataset.tabTarget, { focus: true });
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function truncateIssueMessage(value, limit = MAX_ISSUE_MESSAGE_LENGTH) {
  const message = normalizeString(value);
  return message.length > limit ? `${message.slice(0, Math.max(0, limit - 1))}…` : message;
}

function warningCategory(message) {
  const normalized = normalizeString(message).toLowerCase();
  if (normalized.includes("description") && normalized.includes("characters")) return "description length";
  if (normalized.includes("defaulted video profile")) return "defaulted video profile";
  if (normalized.includes("unsupported nonempty column")) return "unsupported column";
  if (normalized.includes("episode number")) return "episode external id check";
  if (normalized.includes("experimental")) return "experimental type";
  return normalized
    .replace(/(?:warning|error) at [a-z]+\d+:\s*/g, "")
    .replace(/\b\d+\b/g, "#")
    .slice(0, 80) || "other warning";
}

function summarizeWarnings(records = []) {
  const categories = new Map();
  records.forEach((record) => {
    const message = truncateIssueMessage(record?.message || record);
    if (!message) return;
    const category = warningCategory(record?.category || message);
    const entry = categories.get(category) || { count: 0, representatives: [], messages: new Set() };
    entry.count += 1;
    if (!entry.messages.has(message) && entry.representatives.length < MAX_WARNING_REPRESENTATIVES) {
      entry.messages.add(message);
      entry.representatives.push(message);
    }
    categories.set(category, entry);
  });
  const categoryEntries = [...categories.entries()];
  const hasOverflow = categoryEntries.length > MAX_WARNING_CATEGORIES;
  const visibleEntries = hasOverflow ? categoryEntries.slice(0, MAX_WARNING_CATEGORIES - 1) : categoryEntries;
  const summaries = visibleEntries.map(([category, entry]) => {
    const prefix = entry.count > 1 ? `${entry.count} ${category} warning(s)` : `${category}:`;
    const representatives = entry.representatives.join("; ");
    return truncateIssueMessage(representatives ? `${prefix} ${representatives}` : prefix);
  });
  if (hasOverflow) {
    const omittedEntries = categoryEntries.slice(MAX_WARNING_CATEGORIES - 1);
    const overflowedWarnings = omittedEntries.reduce((total, [, entry]) => total + entry.count, 0);
    summaries.push(truncateIssueMessage(`${overflowedWarnings} warning(s) across ${omittedEntries.length} additional warning category/categories omitted.`));
  }
  return summaries;
}

function boundDetailedMessages(messages = []) {
  const unique = new Set();
  const bounded = [];
  let overflowed = 0;
  messages.forEach((message) => {
    const safe = truncateIssueMessage(message);
    if (!safe || unique.has(safe)) return;
    unique.add(safe);
    if (bounded.length >= MAX_DETAILED_ISSUES) {
      overflowed += 1;
      return;
    }
    bounded.push(safe);
  });
  if (overflowed) {
    bounded.pop();
    overflowed += 1;
    bounded.push(`${overflowed} additional detailed issue(s) omitted.`);
  }
  return bounded;
}

function boundRowIssues(entries = []) {
  const seen = new Set();
  const bounded = [];
  let shown = 0;
  let overflowed = 0;
  for (const entry of entries) {
    const errors = [];
    for (const message of entry.errors || []) {
      const safe = truncateIssueMessage(message);
      if (!safe || seen.has(safe)) continue;
      seen.add(safe);
      if (shown >= MAX_DETAILED_ISSUES) {
        overflowed += 1;
      } else {
        errors.push(safe);
        shown += 1;
      }
    }
    if (errors.length) {
      bounded.push({ ...entry, errors });
    }
  }
  if (overflowed) {
    const lastEntry = bounded.at(-1);
    if (lastEntry?.errors.length) {
      lastEntry.errors.pop();
      if (!lastEntry.errors.length) bounded.pop();
      overflowed += 1;
    }
    bounded.push({ row: 0, errors: [`${overflowed} additional detailed issue(s) omitted.`], raw_row: {} });
  }
  return bounded;
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

function preflightStatusLabel(result) {
  if (!result) {
    return "No generated document yet.";
  }
  if (result.stale) {
    return "Out of date";
  }
  if (result.errors?.length) {
    return "Blocked";
  }
  if (result.warnings?.length) {
    return "Warnings";
  }
  return "Ready";
}

function renderPreflight(result = null) {
  const preflight = byId("preflight");
  const liveSummary = byId("preflight-live-summary");
  if (!preflight) {
    return;
  }

  const status = preflightStatusLabel(result);
  preflight.className = "preflight";
  if (!result) {
    preflight.innerHTML = "<strong id=\"preflight-heading\">Preflight</strong><span>No generated document yet.</span>";
    if (liveSummary) liveSummary.textContent = "Preflight: no generated document yet.";
    return;
  }

  if (result.errors?.length) {
    preflight.classList.add("error");
  } else if (result.warnings?.length) {
    preflight.classList.add("warn");
  } else {
    preflight.classList.add("ok");
  }

  const issues = boundDetailedMessages([
    ...(result.errors || []).map((message) => ({ kind: "Error", message })),
    ...(result.warnings || []).map((message) => ({ kind: "Warning", message })),
  ].map((issue) => `${issue.kind}: ${issue.message}`)).map((entry) => {
    const match = entry.match(/^(Error|Warning):\s*(.*)$/);
    return { kind: match ? match[1] : "Issue", message: match ? match[2] : entry };
  });
  const issueList = issues.length
    ? `<ul>${issues.map((issue) => `<li><strong>${issue.kind}:</strong> ${escapeHtml(issue.message)}</li>`).join("")}</ul>`
    : "<p>No blocking errors or warnings found.</p>";

  preflight.innerHTML = `<strong id="preflight-heading">Preflight: ${status}</strong>${issueList}`;
  if (liveSummary) liveSummary.textContent = `Preflight: ${status}. ${issues.length ? `${issues.length} issue${issues.length === 1 ? "" : "s"}.` : "No issues."}`;
}

function renderDocument(document, preflightResult = null, source = "") {
  state.currentDocument = document && typeof document === "object" ? document : null;
  state.currentDocumentSource = state.currentDocument ? source : "";
  state.currentJson = state.currentDocument
    ? JSON.stringify(state.currentDocument, null, 2)
    : '{\n  "name": "AxinomIngest",\n  "items": []\n}';

  const output = byId("json-output");
  if (output) {
    output.innerHTML = syntaxHighlightJson(state.currentJson);
  }

  const ready = Boolean(state.currentDocument) && (!preflightResult || !preflightResult.errors?.length);
  byId("download-json").disabled = !ready;
  byId("copy-json").disabled = !ready;
  renderPreflight(preflightResult);
}

function renderStaleOutput(surface) {
  if (!state.currentDocument || state.currentDocumentSource !== surface) return;
  updateDocumentMetaDisplay(surface);
  renderDocument(null, {
    stale: true,
    ok: false,
    status: "stale",
    errors: [],
    warnings: ["Inputs changed. Generate JSON again."],
  });
  setStatus("Inputs changed. Generate JSON again.", "warn");
}

function renderBlockedPreflight(errors, warnings = [], source = "") {
  const result = {
    ok: false,
    status: "error",
    errors: Array.isArray(errors) ? errors.filter(Boolean) : [String(errors || "Preflight failed.")],
    warnings: Array.isArray(warnings) ? warnings.filter(Boolean) : [],
  };
  if (state.currentDocument && source && state.currentDocumentSource !== source) {
    renderPreflight(result);
  } else {
    renderDocument(null, result);
  }
  return result;
}

function setStatus(message, kind = "") {
  const status = byId("status");
  status.textContent = truncateIssueMessage(message, MAX_STATUS_MESSAGE_LENGTH);
  status.className = `status${kind ? ` ${kind}` : ""}`;
}

function descriptionLength(value) {
  return typeof value === "string" ? value.length : String(value || "").length;
}

function descriptionWarning(value, label = "Description") {
  const count = descriptionLength(value);
  return count > DESCRIPTION_WARN_LENGTH
    ? `${label} is ${count}/${DESCRIPTION_WARN_LENGTH} characters. Axinom descriptions should be ${DESCRIPTION_WARN_LENGTH} characters or fewer.`
    : "";
}

function updateDescriptionCounter(input, counter, label = null) {
  if (!input || !counter) {
    return;
  }
  const count = descriptionLength(input.value);
  const isOver = count > DESCRIPTION_WARN_LENGTH;
  counter.textContent = `${count}/${DESCRIPTION_WARN_LENGTH}`;
  counter.classList.toggle("is-over-limit", isOver);
  input.classList.toggle("is-over-limit", isOver);
  const fieldLabel = input.closest?.("label");
  if (fieldLabel) {
    fieldLabel.classList.toggle("is-over-limit", isOver);
  }
  if (label && isOver) {
    input.title = descriptionWarning(input.value, label);
  } else if (label) {
    input.removeAttribute("title");
  }
}

function updateAllDescriptionCounters() {
  updateDescriptionCounter(byId("single-description"), byId("single-description-count"), "Document Description");
  updateDescriptionCounter(byId("field-description"), byId("field-description-count"), "Description");
  updateDescriptionCounter(byId("bulk-description"), byId("bulk-description-count"), "Document Description");
  updateDescriptionCounter(byId("direct-description"), byId("direct-description-count"), "Document Description");
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
  const required = new Set(["program_type"]);
  for (const field of PROGRAM_TYPE_CONFIG[programType]?.required || []) {
    if (field === "index") {
      required.add(["SEASON", "PODCAST_SEASON"].includes(programType) ? "season_index" : "episode_index");
    } else {
      required.add(field);
    }
  }
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

function updateSingleParentTypeOptions() {
  const programType = byId("field-program_type").value;
  populateSingleSelect(byId("field-parent_type"), allowedParentTypesFor(programType));
}

function updateSingleVideoProfileOptions() {
  populateSingleSelect(byId("field-video_profile"), VIDEO_PROFILES, byId("field-video_profile")?.value);
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
  const required = [...requiredFieldsForSingle(programType, currentSingleIngestMode())].filter((field) => field !== "program_type");
  const generationInputs = {
    MOVIE: ["Title", "Studio"],
    TVSHOW: ["Series or Title", "Studio"],
    PODCAST: ["Series or Title", "Studio"],
    SEASON: ["Series", "Season Number", "Studio"],
    EPISODE: ["Series", "Season Number", "Episode Number", "Studio"],
    PODCAST_SEASON: ["Series", "Season Number", "Studio"],
    PODCAST_EPISODE: ["Series", "Season Number", "Episode Number", "Studio"],
    TRAILER: ["Title", "Studio"],
    EXTRA: ["Title", "Studio"],
  }[programType] || [];
  byId("required-fields").textContent = required.length
    ? `Required fields for ${programType}: ${required.map((field) => singleFieldLabel(field)).join(", ")}. External ID: enter one, or provide ${generationInputs.join(" and ") || "the supported generation inputs"} to generate it.`
    : `No required field metadata found for ${programType}.`;
  updateRequiredFieldStyles();
}

function updateVisibleFields() {
  const visible = currentVisibleSingleFields();
  const programType = byId("field-program_type").value;
  updateSingleParentTypeOptions();
  document.querySelectorAll("#single-fields-grid [data-field]").forEach((node) => {
    node.classList.toggle("hidden-field", !visible.has(node.dataset.field));
  });
  const videoProfile = byId("field-video_profile");
  if (visible.has("video_profile") && videoProfile && !normalizeString(videoProfile.value)) {
    videoProfile.value = DEFAULT_VIDEO_PROFILE;
  }
  updateRequiredFieldStyles();
  updateAllDescriptionCounters();
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

function updateSingleGeneratedId() {
  const externalId = byId("field-external_id");
  const message = byId("single-external-id-state");
  if (!externalId) return;
  const fields = collectSinglePayload().fields;
  const generated = generateExternalId(fields);
  const current = normalizeString(externalId.value);
  const isCustom = Boolean(current && current !== state.singleLastGeneratedId);
  let generatedValueChanged = false;
  if (!isCustom && generated.ok) {
    generatedValueChanged = externalId.value !== generated.value;
    externalId.value = generated.value;
    state.singleLastGeneratedId = generated.value;
    const parentInput = byId("field-parent_external_id");
    if (parentInput && generated.parentExternalId && (!normalizeString(parentInput.value) || normalizeString(parentInput.value) === state.singleLastGeneratedParentId)) {
      generatedValueChanged = generatedValueChanged || parentInput.value !== generated.parentExternalId;
      parentInput.value = generated.parentExternalId;
      state.singleLastGeneratedParentId = generated.parentExternalId;
    }
  }
  if (message) message.textContent = isCustom ? "Custom override" : (generated.ok ? "Auto-generated" : `Needs ${generated.missing.join(", ") || "generation inputs"}`);
  const episodeWarning = validateEpisodeExternalId(fields.program_type, externalId.value, fields.episode_index);
  const warningRegion = byId("single-episode-warning");
  if (warningRegion) warningRegion.textContent = episodeWarning.warning;
  if (generatedValueChanged) syncSingleDocumentMetadata();
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

function buildDocumentName(subject, suffix) {
  const subjectSection = codeSafeSection(subject) || "Axinom";
  const suffixSections = suffixSectionsFromLabel(suffix || "Ingest");
  return joinAndLimitDocumentNameSections([subjectSection, ...suffixSections]);
}

function documentSubjectFromFields(fields) {
  const programType = normalizeProgramType(fields.program_type);
  const title = normalizeString(fields.title);
  const seriesHint = normalizeString(fields.series_hint);
  const externalId = normalizeString(fields.external_id);
  const parentExternalId = normalizeString(fields.parent_external_id);

  if (programType === "MOVIE") {
    return title || humanizeIdentifier(externalId) || "Movie";
  }
  if (programType === "TVSHOW") {
    return title || humanizeIdentifier(externalId) || "TV Show";
  }
  if (programType === "PODCAST") {
    return title || humanizeIdentifier(externalId) || "Podcast";
  }
  if (programType === "SEASON" || programType === "PODCAST_SEASON") {
    return seriesHint || humanizeIdentifier(parentExternalId) || title || humanizeIdentifier(externalId) || (programType === "SEASON" ? "TV Show" : "Podcast");
  }
  if (programType === "EPISODE" || programType === "PODCAST_EPISODE") {
    return seriesHint || humanizeIdentifier(stripSeasonSuffix(parentExternalId) || parentExternalId) || title || humanizeIdentifier(externalId) || (programType === "EPISODE" ? "TV Show" : "Podcast");
  }
  if (programType === "TRAILER" || programType === "EXTRA") {
    return title || humanizeIdentifier(parentExternalId) || humanizeIdentifier(externalId) || programType;
  }
  return title || humanizeIdentifier(externalId) || "Axinom";
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
  if (programType === "PODCAST") {
    return { name: buildDocumentName(subject, "Podcast Ingest"), description: `Single-item podcast ingest for ${subject}.` };
  }
  if (programType === "SEASON" || programType === "PODCAST_SEASON") {
    const noun = programType === "PODCAST_SEASON" ? "podcast season" : "season";
    return {
      name: buildDocumentName(subject, `${index ? `S${index}` : "Season"} Ingest`),
      description: `Single-item ${noun} ingest for ${subject}${index ? ` season ${index}` : ""}.`,
    };
  }
  if (programType === "EPISODE" || programType === "PODCAST_EPISODE") {
    const noun = programType === "PODCAST_EPISODE" ? "podcast episode" : "episode";
    if (seasonIndex && index) {
      return {
        name: buildDocumentName(subject, `S${seasonIndex} E${index} Ingest`),
        description: `Single-item ${noun} ingest for ${subject}, season ${seasonIndex} episode ${index}.`,
      };
    }
    if (index) {
      return {
        name: buildDocumentName(subject, `Episode ${index} Ingest`),
        description: `Single-item ${noun} ingest for ${subject}, episode ${index}.`,
      };
    }
    return { name: buildDocumentName(subject, "Episode Ingest"), description: `Single-item ${noun} ingest for ${subject}.` };
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
    series_hint: readInputValue(byId("field-series_hint")),
    season_index: readInputValue(byId("field-season_index")),
    episode_index: readInputValue(byId("field-episode_index")),
    index: readInputValue(byId("field-episode_index")) || readInputValue(byId("field-season_index")),
  });
}

function defaultBatchMetadata(mode) {
  if (mode === "bulk") {
    return {
      name: buildDocumentName("Axinom", "Bulk Ingest"),
      description: "Bulk ingest converted from the current workbook.",
    };
  }
  return {
    name: buildDocumentName("Axinom", "Direct Sheet Ingest"),
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

  updateAllDescriptionCounters();
  setCurrentDownloadName(nameInput.value || "AxinomIngest");
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
  updateAllDescriptionCounters();
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
  updateAllDescriptionCounters();
}

function formatDocumentNameError(name) {
  const clean = normalizeString(name);
  if (!clean) {
    return "Document Name is required.";
  }
  if (!/^[A-Za-z0-9_]+$/.test(clean)) {
    return "Document Name may only contain letters, numbers, and underscores.";
  }
  if (clean.length > DOCUMENT_NAME_MAX_LENGTH) {
    return `Document Name must be ${DOCUMENT_NAME_MAX_LENGTH} characters or fewer.`;
  }
  return "";
}

function experimentalProgramTypeWarning(programType) {
  return EXPERIMENTAL_PROGRAM_TYPES.has(programType) && !AXINOM_CONFIRMED_INGEST_TYPES.has(programType)
    ? `${programType} is experimental and not yet present in the current Axinom MediaService introspection.`
    : "";
}

function preflightDocument(document, warnings = []) {
  const errors = [];
  // Experimental-type warnings are derived from the generated items below so
  // import-row compatibility diagnostics cannot count the same item twice.
  const warningRecords = (warnings || [])
    .map((warning) => typeof warning === "object" && warning !== null ? warning : { message: warning })
    .filter((warning) => warningCategory(warning.category || warning.message) !== "experimental type");

  if (!document || typeof document !== "object") {
    errors.push("No ingest document has been generated.");
    return { ok: false, status: "error", errors, warnings: summarizeWarnings(warningRecords) };
  }

  const nameError = formatDocumentNameError(document.name);
  if (nameError) {
    errors.push(nameError);
  }

  if (!Array.isArray(document.items) || !document.items.length) {
    errors.push("Document must contain at least one ingest item.");
  }

  const externalIds = new Map();
  (document.items || []).forEach((item, index) => {
    const itemNumber = index + 1;
    const itemType = normalizeProgramType(item?.type);
    const externalId = normalizeString(item?.external_id);

    if (!PROGRAM_TYPE_CONFIG[itemType]) {
      errors.push(`Item ${itemNumber} has unsupported program type '${normalizeString(item?.type)}'.`);
    }

    const experimentalWarning = experimentalProgramTypeWarning(itemType);
    if (experimentalWarning) {
      warningRecords.push({ message: experimentalWarning, category: "experimental type" });
    }

    if (!externalId) {
      errors.push(`Item ${itemNumber} is missing external_id.`);
      return;
    }

    if (externalIds.has(externalId)) {
      errors.push(`Duplicate external_id '${externalId}' appears in item ${externalIds.get(externalId)} and item ${itemNumber}.`);
    } else {
      externalIds.set(externalId, itemNumber);
    }
  });

  const uniqueWarnings = boundDetailedMessages(summarizeWarnings(warningRecords));
  return {
    ok: errors.length === 0,
    status: errors.length ? "error" : (uniqueWarnings.length ? "warn" : "ok"),
    errors: boundDetailedMessages(errors),
    warnings: uniqueWarnings,
  };
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
    return buildValidatedDate(Number(match[1]), Number(match[2]), Number(match[3])) || "";
  }

  match = text.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (match) {
    return buildValidatedDate(Number(match[1]), Number(match[2]), Number(match[3])) || "";
  }

  match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    return buildValidatedDate(Number(match[3]), Number(match[1]), Number(match[2])) || "";
  }

  match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (match) {
    const shortYear = Number(match[3]);
    const year = shortYear <= 68 ? 2000 + shortYear : 1900 + shortYear;
    return buildValidatedDate(year, Number(match[1]), Number(match[2])) || "";
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

function parseExcelSerial(value) {
  const text = normalizeString(value);
  if (!/^\d{1,7}(?:\.\d+)?$/.test(text)) {
    return null;
  }
  const serial = Number(text);
  if (!Number.isFinite(serial) || serial < 10000 || serial > 2958465) {
    return null;
  }
  return serial;
}

function excelSerialToDate(serial, date1904 = false) {
  const dayMs = 24 * 60 * 60 * 1000;
  const base = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 30);
  return new Date(base + Math.round(serial * dayMs));
}

function excelSerialHasTime(serial) {
  return Math.abs(serial - Math.trunc(serial)) > 0.000001;
}

function excelSerialToDateOnly(value, date1904 = false) {
  const serial = parseExcelSerial(value);
  if (serial === null) {
    return "";
  }
  const date = excelSerialToDate(Math.trunc(serial), date1904);
  return `${date.getUTCFullYear()}-${padTwoDigits(date.getUTCMonth() + 1)}-${padTwoDigits(date.getUTCDate())}`;
}

function excelSerialToUtcDateTime(value, boundary = "start", date1904 = false) {
  const serial = parseExcelSerial(value);
  if (serial === null) {
    return "";
  }
  if (!excelSerialHasTime(serial)) {
    const dateOnly = excelSerialToDateOnly(serial, date1904);
    return boundary === "end"
      ? `${dateOnly}T23:59:59.999+00:00`
      : `${dateOnly}T00:00:00.000+00:00`;
  }
  const date = excelSerialToDate(serial, date1904);
  return `${date.getUTCFullYear()}-${padTwoDigits(date.getUTCMonth() + 1)}-${padTwoDigits(date.getUTCDate())}T${padTwoDigits(date.getUTCHours())}:${padTwoDigits(date.getUTCMinutes())}:${padTwoDigits(date.getUTCSeconds())}.${String(date.getUTCMilliseconds()).padStart(3, "0")}+00:00`;
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

  return "";
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

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+\-]\d{2}:\d{2})$/);
  if (isoMatch) {
    const timezone = isoMatch[8] === "Z" ? "+00:00" : isoMatch[8];
    const timezoneMatch = timezone.match(/^([+\-])(\d{2}):(\d{2})$/);
    if (!timezoneMatch || Number(timezoneMatch[2]) > 23 || Number(timezoneMatch[3]) > 59) {
      return "";
    }
    return formatDateTimeParts(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3]),
      Number(isoMatch[4]),
      Number(isoMatch[5]),
      Number(isoMatch[6] || 0),
      Number(String(isoMatch[7] || "0").padEnd(3, "0")),
      timezone,
    );
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

  return "";
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

  const languageTag = normalizeString(fields.language_tag);
  const localizedTitle = normalizeString(fields.localized_title);
  const localizedDescription = normalizeString(fields.localized_description);
  const localizedSynopsis = normalizeString(fields.localized_synopsis);
  if (languageTag && (localizedTitle || localizedDescription || localizedSynopsis)) {
    data.localizations = [{ language_tag: languageTag, ...(localizedTitle ? { title: localizedTitle } : {}), ...(localizedDescription ? { description: localizedDescription } : {}), ...(localizedSynopsis ? { synopsis: localizedSynopsis } : {}) }];
  }
  const trailerSource = normalizeString(fields.trailer_source);
  const trailerProfile = normalizeString(fields.trailer_profile);
  if (trailerSource || trailerProfile) {
    data.trailers = [{ ...(trailerSource ? { source: trailerSource } : {}), ...(trailerProfile ? { profile: trailerProfile } : {}) }];
  }

  return data;
}

function deriveParentExternalId(externalId, ingestType) {
  if (!externalId) {
    return "";
  }
  if (ingestType === "EPISODE" || ingestType === "PODCAST_EPISODE") {
    const parent = externalId.replace(/([_-]E\d+)$/i, "");
    return parent !== externalId ? parent : "";
  }
  if (ingestType === "SEASON" || ingestType === "PODCAST_SEASON") {
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
  const sourceCells = fields._sourceCells || {};
  const indexResolution = resolveIndexFields({ ...fields, program_type: ingestType }, sourceCells);
  const studioResolution = resolveStudioProvider(fields, sourceCells);
  const identity = resolveExternalId({ ...fields, program_type: ingestType });
  warnings.push(...indexResolution.warnings, ...studioResolution.warnings, ...identity.warnings);
  const effectiveFields = { ...fields, program_type: ingestType, index: indexResolution.value, studio: studioResolution.value, external_id: identity.value };
  if (!normalizeString(effectiveFields.parent_external_id) && identity.generatedParentExternalId) {
    effectiveFields.parent_external_id = identity.generatedParentExternalId;
    if (!normalizeString(effectiveFields.parent_type) && identity.generatedParentType) effectiveFields.parent_type = identity.generatedParentType;
    warnings.push("Derived parent_external_id from generated external_id");
  }
  const profile = profileForFields(effectiveFields, { surface: fields._surface || "single", templateVersion: fields._templateVersion || "" });
  effectiveFields.video_profile = profile.value;
  const externalId = identity.value;
  const parentType = normalizeProgramType(effectiveFields.parent_type);
  const releasedInput = normalizeString(fields.released);
  const licenseStartInput = normalizeString(fields.license_start);
  const licenseEndInput = normalizeString(fields.license_end);

  if (releasedInput && !parseDateValue(releasedInput)) {
    errors.push("Field 'released' must be a valid date");
  }
  if (licenseStartInput && !parseDateTimeToUtcString(licenseStartInput, "start")) {
    errors.push("Field 'license_start' must be a valid date/time");
  }
  if (licenseEndInput && !parseDateTimeToUtcString(licenseEndInput, "end")) {
    errors.push("Field 'license_end' must be a valid date/time");
  }

  const experimentalWarning = experimentalProgramTypeWarning(ingestType);
  if (experimentalWarning) {
    warnings.push(experimentalWarning);
  }

  if (identity.source === "missing") {
    identity.missing.forEach((field) => errors.push(`Missing generation input: ${field}`));
  }
  if ((normalizeString(effectiveFields.localized_title) || normalizeString(effectiveFields.localized_description) || normalizeString(effectiveFields.localized_synopsis)) && !normalizeString(effectiveFields.language_tag)) {
    errors.push("Localized values require Language Tag");
  }
  if (normalizeString(effectiveFields.trailer_profile) && !normalizeString(effectiveFields.trailer_source)) {
    errors.push("Trailer Profile requires Trailer Source");
  }

  const data = buildData(effectiveFields);

  if (["TVSHOW", "PODCAST", "SEASON", "PODCAST_SEASON"].includes(ingestType)) {
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

  const episodeValidation = validateEpisodeExternalId(ingestType, externalId, effectiveFields.index);
  if (episodeValidation.warning) warnings.push(episodeValidation.warning);

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
  let seriesFallback = "";

  Object.entries(row).forEach(([header, value]) => {
    const normalizedHeader = normalizeHeader(header);
    const field = HEADER_TO_FIELD[normalizedHeader];
    const cleaned = normalizeString(value);
    if (!field || !cleaned) {
      return;
    }

    if (normalizedHeader === "series") {
      seriesFallback = cleaned;
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
  if (/^\d+$/.test(mapped.external_id) && /[A-Za-z]/.test(seriesFallback) && seriesFallback.includes("_")) {
    mapped.external_id = seriesFallback;
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
    PODCAST: "Podcast",
    SEASON: "Season",
    EPISODE: "Episode",
    PODCAST_SEASON: "Podcast season",
    PODCAST_EPISODE: "Podcast episode",
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
    description: ["description"],
    released: ["releaseddate", "pubdate", "year"],
    index: ["seasonepnumber", "seasonepisodeindex", "episodenumber", "seasonnumber"],
    studio: ["studio", "provider", "contentprovider"],
    language_tag: ["languagetag", "language"],
    localized_title: ["localizedtitle"],
    localized_description: ["localizeddescription"],
    localized_synopsis: ["localizedsynopsis"],
    trailer_source: ["trailersource"],
    trailer_profile: ["trailerprofile"],
    parent_type: ["parenttype"],
    parent_external_id: ["parentexternalid"],
    license_start: ["licensestartutc", "availabledate"],
    license_end: ["licenseendutc", "expirationdate"],
    license_countries: ["licensecountries", "availabilitylabels"],
    video_source: ["videosource"],
    video_profile: ["videoprofile"],
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
  } else if (error === "Field 'released' must be a valid date") {
    field = "released";
    message = "Released Date must be a valid date";
  } else if (error === "Field 'license_start' must be a valid date/time") {
    field = "license_start";
    message = "License Start must be a valid date/time";
  } else if (error === "Field 'license_end' must be a valid date/time") {
    field = "license_end";
    message = "License End must be a valid date/time";
  } else if (error === "Localized values require Language Tag") {
    field = "language_tag";
    message = "Language Tag is required when localized values are present";
  } else if (error === "Trailer Profile requires Trailer Source") {
    field = "trailer_profile";
    message = "Trailer Source is required when Trailer Profile is set";
  } else if (error.startsWith("Field 'parent_type' must be one of: ")) {
    field = "parent_type";
    message = error.replace("Field 'parent_type' ", "Parent Type ");
  } else if (error.startsWith("Unsupported program type ")) {
    field = "program_type";
  } else if (error.startsWith("Duplicate external_id ")) {
    field = "external_id";
    message = error.replace("Duplicate external_id", "Duplicate External ID");
  }

  let cellRef = field ? sheetErrorCellRef(field, rowCells || {}) : "";
  if (!cellRef && error === "Localized values require Language Tag") {
    cellRef = sheetErrorCellRef("localized_title", rowCells || {}) || sheetErrorCellRef("localized_description", rowCells || {}) || sheetErrorCellRef("localized_synopsis", rowCells || {});
  }
  return cellRef ? `Error at ${cellRef}: ${message}` : `Error at row ${rowNumber}: ${message}`;
}

function rowsToDocument({ rows, documentName, sourceName, sheetName, documentDescription = "", rowNumbers = [], rowCells = [], templateVersion = "", surface = "bulk", unsupportedHeaders = [] }) {
  const items = [];
  const warningRecords = [];
  const rowErrors = [];
  const rowWarnings = [];
  const compatibilityWarningRows = new Map();
  const externalIds = new Map();
  let generatedIds = 0;
  let defaultedProfiles = 0;
  let preservedLegacyProfiles = 0;
  const defaultedProfileRefs = [];
  const addWarning = (message, category = "") => {
    if (normalizeString(message)) warningRecords.push({ message, category });
  };
  const safeDocumentName = sanitizeDocumentName(documentName, "AxinomIngest");
  const documentDescriptionWarning = descriptionWarning(documentDescription, "Document Description");
  if (documentDescriptionWarning) {
    addWarning(documentDescriptionWarning, "document description length");
  }

  const uniqueUnsupportedHeaders = [...new Set(unsupportedHeaders.filter(Boolean))];
  uniqueUnsupportedHeaders.slice(0, 10).forEach((header) => addWarning(`Unsupported nonempty column '${header}' was ignored.`, "unsupported column"));
  if (uniqueUnsupportedHeaders.length > 10) {
    addWarning(`${uniqueUnsupportedHeaders.length - 10} additional unsupported nonempty column(s) were ignored.`, "unsupported column overflow");
  }
  rows.forEach((row, index) => {
    const rowNumber = rowNumbers[index] || index + 2;
    const rowCellMap = rowCells[index] || {};
    const mappedFields = mapRowToFields(row);

    if (!Object.values(mappedFields).some((value) => normalizeString(value))) {
      return;
    }
    const fields = { ...mappedFields, _sourceCells: Object.fromEntries(Object.entries(rowCellMap).map(([header, cell]) => [HEADER_TO_FIELD[normalizeHeader(header)] || normalizeHeader(header), cell])), _templateVersion: templateVersion, _surface: surface };

    const rowDescriptionWarning = descriptionWarning(fields.description, "Description");
    if (rowDescriptionWarning) {
      const descriptionCell = sheetErrorCellRef("description", rowCellMap);
      addWarning(descriptionCell ? `${descriptionCell}: ${rowDescriptionWarning}` : `Row ${rowNumber}: ${rowDescriptionWarning}`, "description length");
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

    if (!normalizeString(mappedFields.external_id)) generatedIds += 1;
    const profileResult = profileForFields(fields, { surface, templateVersion });
    if (profileResult.defaulted) {
      defaultedProfiles += 1;
      defaultedProfileRefs.push(sheetErrorCellRef("video_profile", rowCellMap) || `row ${rowNumber}`);
    }
    if (profileResult.preservedLegacy) preservedLegacyProfiles += 1;

    const rowExternalId = normalizeString(buildResult.item.external_id);
    if (externalIds.has(rowExternalId)) {
      rowErrors.push({
        row: rowNumber,
        errors: [formatSheetErrorMessage(`Duplicate external_id '${rowExternalId}' matches row ${externalIds.get(rowExternalId)}`, {
          rowNumber,
          rowCells: rowCellMap,
          normalizedProgramType: normalizeProgramType(fields.program_type),
        })],
        raw_row: row,
      });
      return;
    }
    externalIds.set(rowExternalId, rowNumber);

    items.push(buildResult.item);
    buildResult.warnings.forEach((warning) => {
      const rowsForWarning = compatibilityWarningRows.get(warning) || [];
      rowsForWarning.push(rowNumber);
      compatibilityWarningRows.set(warning, rowsForWarning);
      if (/^Episode Number .* (does not match|could not be verified)/.test(warning)) {
        const externalCell = sheetErrorCellRef("external_id", rowCellMap);
        const episodeCell = sheetErrorCellRef("index", rowCellMap);
        const warningCells = [externalCell, episodeCell].filter(Boolean);
        if (rowWarnings.length < MAX_DETAILED_ISSUES) rowWarnings.push({ row: rowNumber, warnings: warningCells.map((cell) => truncateIssueMessage(`Warning at ${cell}: ${warning}`)).slice(0, MAX_WARNING_REPRESENTATIVES) });
      }
    });
  });

  const nameError = formatDocumentNameError(safeDocumentName);
  if (nameError) {
    rowErrors.push({ row: 0, errors: [nameError], raw_row: {} });
  }

  if (!items.length && !rowErrors.length) {
    rowErrors.push({ row: 0, errors: ["No ingest rows found in spreadsheet."], raw_row: {} });
  }

  if (defaultedProfiles && surface === "bulk" && normalizeString(templateVersion).replace(/^v/i, "") === "2.2.0") {
    addWarning(`Defaulted Video Profile to ${DEFAULT_VIDEO_PROFILE} for ${defaultedProfiles} row(s); representative source: ${defaultedProfileRefs[0]}.`, "defaulted video profile");
  }
  compatibilityWarningRows.forEach((rowNumbersForWarning, warning) => {
    addWarning(`${warning} (${rowNumbersForWarning.length} row(s); representative row ${rowNumbersForWarning[0]}).`, warningCategory(warning));
  });

  let document = items.length
    ? {
        name: safeDocumentName,
        ...(normalizeString(documentDescription) ? { description: normalizeString(documentDescription) } : {}),
        items,
        document_created: currentDocumentCreated(),
        helper_version: HELPER_VERSION,
      }
    : null;
  const preflight = document ? preflightDocument(document, warningRecords) : null;
  if (preflight?.errors.length) {
    rowErrors.push({ row: 0, errors: preflight.errors, raw_row: {} });
  }
  const ok = Boolean(document) && rowErrors.length === 0 && (!preflight || preflight.ok);
  if (!ok) {
    document = null;
  }

  return {
    ok,
    document,
    errors: boundRowIssues(rowErrors),
    warnings: preflight?.warnings || summarizeWarnings(warningRecords),
    rowWarnings: rowWarnings.slice(0, MAX_DETAILED_ISSUES),
    preflight,
    stats: {
      source: sourceName,
      sheet: sheetName,
      rows_read: rows.length,
      items_created: items.length,
      generated_ids: generatedIds,
      defaulted_profiles: defaultedProfiles,
      preserved_legacy_profiles: preservedLegacyProfiles,
      template_version: templateVersion || "legacy/unknown",
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
    if (fieldId === "external_id" && generateExternalId(payload.fields).ok) {
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
  payload.name = normalizeDocumentNameInput(byId("single-name"), "AxinomSingleIngest");
  const validationError = validateSinglePayload(payload);
  if (validationError) {
    renderBlockedPreflight([validationError], [], "single");
    setStatus(validationError, "error");
    return;
  }

  const buildResult = buildItem(payload.fields);
  if (buildResult.errors.length) {
    renderBlockedPreflight(buildResult.errors, buildResult.warnings, "single");
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

  const warnings = [
    descriptionWarning(payload.description, "Document Description"),
    descriptionWarning(payload.fields.description, "Description"),
    ...buildResult.warnings,
  ].filter(Boolean);
  const preflight = preflightDocument(document, warnings);

  updateDocumentMetaDisplay("single", document.document_created);
  renderDocument(preflight.ok ? document : null, preflight, "single");
  setCurrentDownloadName(document.name);

  if (!preflight.ok) {
    setStatus(`Preflight blocked output: ${preflight.errors.join(" | ")}`, "error");
    return;
  }

  if (preflight.warnings.length) {
    setStatus(`Generated with warning(s): ${preflight.warnings.join(" | ")}`, "warn");
    return;
  }

  setStatus("Single item JSON generated.", "ok");
}

function clearSingle() {
  renderStaleOutput("single");
  byId("field-program_type").value = "MOVIE";
  byId("single-ingest-mode").value = "SIMPLE";
  state.singleNameDirty = false;
  state.singleDescriptionDirty = false;
  state.singleLastGeneratedId = "";
  state.singleLastGeneratedParentId = "";

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
  updateDocumentMetaDisplay("single");
  updateAllDescriptionCounters();
  syncSingleDocumentMetadata(true);
  updateRequiredHint();
  updateVisibleFields();
  updateSingleGeneratedId();
  if (!state.currentDocument) {
    renderPreflight();
    setStatus("Ready.");
  }
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
  link.download = `${state.currentDownloadName || "AxinomIngest"}.json`;
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
  if (columnName === "Season Number" || columnName === "Episode Number") {
    return { kind: "input", type: "number" };
  }
  if (columnName === "Production Countries") {
    return { kind: "input", type: "text", list: "country-code-list" };
  }
  if (columnName === "Video Profile") {
    return { kind: "video-profile-select" };
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

function updateDirectDescriptionInput(input) {
  if (!input) {
    return;
  }
  const warning = descriptionWarning(input.value, "Description");
  input.classList.toggle("is-over-limit", Boolean(warning));
  if (warning) {
    input.title = warning;
  } else {
    input.removeAttribute("title");
  }
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

  if (config.kind === "video-profile-select") {
    const select = document.createElement("select");
    populateSingleSelect(select, VIDEO_PROFILES, initialValue);
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
  if (columnName === "Description") {
    input.placeholder = `Max ${DESCRIPTION_WARN_LENGTH} chars`;
    updateDirectDescriptionInput(input);
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
  const type = normalizeProgramType(assetTypeInput.value);
  const implied = { SEASON: "TVSHOW", EPISODE: "SEASON", PODCAST_SEASON: "PODCAST", PODCAST_EPISODE: "PODCAST_SEASON" }[type] || "";
  populateSingleSelect(parentTypeInput, allowedParentTypesFor(type), preferredValue || parentTypeInput.value || implied);
  const profileInput = directRowInput(row, "Video Profile");
  if (profileInput && VIDEO_BEARING_TYPES.has(type) && !normalizeString(profileInput.value)) profileInput.value = DEFAULT_VIDEO_PROFILE;
}

function updateDirectGeneratedId(row) {
  const externalInput = directRowInput(row, "External ID");
  const parentInput = directRowInput(row, "Parent External ID");
  if (!externalInput) return;
  const values = {};
  DIRECT_COLUMNS.forEach((column) => { values[column] = readDirectCellValue(directRowInput(row, column), column); });
  const generated = generateExternalId(mapRowToFields(values));
  const current = normalizeString(externalInput.value);
  const lastGenerated = normalizeString(row.dataset.lastGeneratedExternalId);
  if (generated.ok && (!current || current === lastGenerated)) {
    externalInput.value = generated.value;
    row.dataset.lastGeneratedExternalId = generated.value;
  }
  if (parentInput && generated.parentExternalId) {
    const currentParent = normalizeString(parentInput.value);
    const lastParent = normalizeString(row.dataset.lastGeneratedParentExternalId);
    if (!currentParent || currentParent === lastParent) {
      parentInput.value = generated.parentExternalId;
      row.dataset.lastGeneratedParentExternalId = generated.parentExternalId;
    }
  }
}

function updateDirectRowNumbers() {
  byId("direct-table").querySelectorAll("tbody tr").forEach((row, index) => {
    const rowNumber = index + 2;
    const marker = row.querySelector(".row-marker");
    if (marker) {
      marker.textContent = String(rowNumber);
      marker.id = `direct-row-${rowNumber}`;
      marker.scope = "row";
    }
    DIRECT_COLUMNS.forEach((column) => {
      const control = directRowInput(row, column);
      const columnId = `direct-column-${directColumnKey(column)}`;
      const rowId = `direct-row-${rowNumber}`;
      if (!control) return;
      control.setAttribute("aria-labelledby", `${columnId} ${rowId}`);
      if (control.matches?.("details")) {
        const summary = control.querySelector("summary");
        if (summary) summary.setAttribute("aria-labelledby", `${columnId} ${rowId}`);
        control.querySelectorAll('input[type="checkbox"]').forEach((input) => {
          input.setAttribute("aria-label", `${column}, row ${rowNumber}, ${input.value}`);
        });
        const manual = control.querySelector('[data-country-manual="true"]');
        if (manual) manual.setAttribute("aria-label", `${column}, row ${rowNumber}, other codes`);
      }
    });
  });
}

function appendDirectRow(initialValues = {}) {
  const tbody = byId("direct-table").querySelector("tbody");
  const row = document.createElement("tr");

  const marker = document.createElement("th");
  marker.className = "row-marker";
  marker.scope = "row";
  row.appendChild(marker);

  DIRECT_COLUMNS.forEach((column) => {
    const cell = document.createElement("td");
    const control = createCellInput(column, initialValues[column] || "");
    control.dataset.columnKey = directColumnKey(column);
    const eventTargets = control.matches?.("input, select, textarea")
      ? [control]
      : [...control.querySelectorAll("input, select, textarea")];

    eventTargets.forEach((target) => {
      target.addEventListener("input", () => {
        renderStaleOutput("direct");
        control.classList.remove("is-invalid");
        control.removeAttribute("aria-invalid");
        target.removeAttribute("aria-invalid");
        control.querySelectorAll?.('[aria-invalid="true"]').forEach((node) => node.removeAttribute("aria-invalid"));
        if (column === "Description") {
          updateDirectDescriptionInput(target);
        }
        syncDirectDocumentMetadata();
        if (["Asset Type", "Title", "Studio", "Series", "Season Number", "Episode Number", "Parent Type", "External ID", "Parent External ID"].includes(column)) updateDirectGeneratedId(row);
      });
      target.addEventListener("change", () => {
        renderStaleOutput("direct");
        control.classList.remove("is-invalid");
        control.removeAttribute("aria-invalid");
        target.removeAttribute("aria-invalid");
        control.querySelectorAll?.('[aria-invalid="true"]').forEach((node) => node.removeAttribute("aria-invalid"));
        if (column === "Description") {
          updateDirectDescriptionInput(target);
        }
        syncDirectDocumentMetadata();
        if (["Asset Type", "Title", "Studio", "Series", "Season Number", "Episode Number", "Parent Type", "External ID", "Parent External ID"].includes(column)) updateDirectGeneratedId(row);
      });
    });

    if (column === "Asset Type") {
      eventTargets.forEach((target) => {
        target.addEventListener("change", () => updateDirectParentTypeOptions(row));
      });
    }

    if (column === "Video Source") {
      eventTargets.forEach((target) => {
        target.addEventListener("input", () => {
          const type = normalizeProgramType(readDirectCellValue(directRowInput(row, "Asset Type"), "Asset Type"));
          const profile = directRowInput(row, "Video Profile");
          if (VIDEO_BEARING_TYPES.has(type) && normalizeString(target.value) && profile && !normalizeString(profile.value)) profile.value = DEFAULT_VIDEO_PROFILE;
        });
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
  rowHeader.scope = "col";
  rowHeader.id = "direct-column-row";
  rowHeader.textContent = "#";
  headRow.appendChild(rowHeader);
  DIRECT_COLUMNS.forEach((column) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.id = `direct-column-${directColumnKey(column)}`;
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
  return readDirectRowsDetailed().rows;
}

function readDirectRowsDetailed() {
  const rows = [];
  const rowNumbers = [];
  const rowCells = [];
  byId("direct-table").querySelectorAll("tbody tr").forEach((row) => {
    const values = {};
    const cellMap = {};
    const rowNumber = [...row.parentElement.children].indexOf(row) + 2;
    DIRECT_COLUMNS.forEach((column, columnIndex) => {
      values[column] = readDirectCellValue(directRowInput(row, column), column);
      cellMap[column] = `${indexToCol(columnIndex + 1)}${rowNumber}`;
    });
    if (Object.values(values).some(Boolean)) {
      rows.push(values);
      rowNumbers.push(rowNumber);
      rowCells.push(cellMap);
    }
  });
  return { rows, rowNumbers, rowCells };
}

function directControlFromCellRef(cellRef) {
  const match = normalizeString(cellRef).match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    return null;
  }
  const columnIndex = colLettersToIndex(match[1]) - 1;
  const rowIndex = Number.parseInt(match[2], 10) - 2;
  const columnName = DIRECT_COLUMNS[columnIndex];
  if (!columnName || rowIndex < 0) {
    return null;
  }
  const row = byId("direct-table").querySelectorAll("tbody tr")[rowIndex];
  return row ? directRowInput(row, columnName) : null;
}

function focusDirectCell(cellRef) {
  const control = directControlFromCellRef(cellRef);
  if (!control) {
    return;
  }
  const target = control.matches?.("details") ? control.querySelector("summary") : control;
  control.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  target?.focus?.();
}

function clearDirectValidation({ hideIssues = true } = {}) {
  byId("direct-table").querySelectorAll(".is-invalid, .is-warning").forEach((node) => node.classList.remove("is-invalid", "is-warning"));
  byId("direct-table").querySelectorAll('[aria-invalid="true"]').forEach((node) => node.removeAttribute("aria-invalid"));
  if (hideIssues) {
    const issues = byId("direct-issues");
    if (issues) {
      issues.hidden = true;
      issues.innerHTML = "";
    }
  }
}

function renderDirectIssues(rowErrors, rowWarnings = []) {
  const issues = byId("direct-issues");
  if (!issues) {
    return;
  }
  const messages = [];
  (rowErrors || []).forEach((entry) => {
    (entry.errors || []).forEach((message) => messages.push(message));
  });
  (rowWarnings || []).forEach((entry) => {
    (entry.warnings || []).forEach((message) => messages.push(message));
  });

  const boundedMessages = boundDetailedMessages(messages);
  if (!boundedMessages.length) {
    issues.hidden = true;
    issues.innerHTML = "";
    return;
  }

  issues.hidden = false;
  issues.innerHTML = `<strong id="direct-issues-heading">Direct Sheet issues</strong><ul>${boundedMessages.map((message, index) => {
    const match = message.match(/^(?:Error|Warning) at ([A-Z]+\d+):/);
    const cellRef = match ? match[1] : "";
    return `<li class="${message.startsWith("Warning") ? "warning" : "error"}">${cellRef ? `<button type="button" class="issue-link" data-cell-ref="${cellRef}">${cellRef}</button> ` : ""}${escapeHtml(message.replace(/^(?:Error|Warning) at [A-Z]+\d+:\s*/, ""))}</li>`;
  }).join("")}</ul>`;

  issues.querySelectorAll("[data-cell-ref]").forEach((button) => {
    button.addEventListener("click", () => focusDirectCell(button.dataset.cellRef));
  });
}

function markDirectValidationIssues(rowErrors, rowWarnings = []) {
  clearDirectValidation({ hideIssues: false });
  (rowErrors || []).forEach((entry) => {
    (entry.errors || []).forEach((message) => {
      const match = message.match(/^Error at ([A-Z]+\d+):/);
      const control = match ? directControlFromCellRef(match[1]) : null;
      if (control) {
        control.classList.add("is-invalid");
        control.setAttribute("aria-invalid", "true");
        control.querySelectorAll?.("input, select, textarea, summary").forEach((node) => node.setAttribute("aria-invalid", "true"));
      }
    });
  });
  (rowWarnings || []).forEach((entry) => {
    (entry.warnings || []).forEach((message) => {
      const match = message.match(/^Warning at ([A-Z]+\d+):/);
      const control = match ? directControlFromCellRef(match[1]) : null;
      if (control) control.classList.add("is-warning");
    });
  });
  renderDirectIssues(rowErrors, rowWarnings);
}

function clearDirectRows() {
  renderStaleOutput("direct");
  buildDirectTable();
  clearDirectValidation();
  syncDirectDocumentMetadata();
}

function convertDirectRows() {
  clearDirectValidation();
  const documentName = normalizeDocumentNameInput(byId("direct-name"), "AxinomDirectSheetIngest");
  const nameError = formatDocumentNameError(documentName);
  if (nameError) {
    renderBlockedPreflight([nameError], [], "direct");
    setStatus(nameError, "error");
    return;
  }

  const directRows = readDirectRowsDetailed();
  if (!directRows.rows.length) {
    const message = "Enter at least one row in the direct sheet.";
    renderBlockedPreflight([message], [], "direct");
    setStatus(message, "error");
    return;
  }

  const result = rowsToDocument({
    rows: directRows.rows,
    documentName,
    sourceName: "direct-sheet",
    sheetName: "Direct Entry",
    documentDescription: normalizeString(byId("direct-description").value),
    rowNumbers: directRows.rowNumbers,
    rowCells: directRows.rowCells,
    surface: "direct",
  });

  if (result.document) {
    updateDocumentMetaDisplay("direct", result.document.document_created);
    renderDocument(result.document, result.preflight, "direct");
    setCurrentDownloadName(result.document.name || documentName);
  }

  if (!result.ok) {
    markDirectValidationIssues(result.errors, result.rowWarnings);
    renderBlockedPreflight(result.errors.flatMap((entry) => entry.errors || []), result.warnings, "direct");
    setStatus(formatErrors(result), "error");
    return;
  }

  const summary = `Converted ${result.stats.items_created || 0} direct row item(s) from ${result.stats.rows_read || 0} row(s).`;
  markDirectValidationIssues([], result.rowWarnings);
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

function workbookSupportError() {
  return typeof DecompressionStream === "function"
    ? ""
    : "This browser does not support the built-in decompression API needed for .xlsx imports. Use current Chrome, Edge, Safari, or Firefox.";
}

function assertWorkbookFile(file) {
  const supportError = workbookSupportError();
  if (supportError) {
    throw new Error(supportError);
  }
  if (!file) {
    throw new Error("Choose a .xlsx file first.");
  }
  if (file.size > MAX_WORKBOOK_BYTES) {
    throw new Error(`Workbook is too large. Maximum supported upload size is ${Math.round(MAX_WORKBOOK_BYTES / (1024 * 1024))} MB.`);
  }
  if (!/\.xlsx$/i.test(file.name || "")) {
    throw new Error("Workbook must be an .xlsx file.");
  }
}

function updateBulkImportAvailability() {
  const note = byId("bulk-support-note");
  const convertButton = byId("convert-bulk");
  const supportError = workbookSupportError();
  if (note) {
    note.hidden = !supportError;
    note.textContent = supportError;
  }
  if (convertButton && supportError) {
    convertButton.disabled = true;
  }
}

async function readStreamWithLimits(stream, { fileName = "workbook entry", entryLimit = MAX_ZIP_ENTRY_BYTES, totalState = { total: 0 }, totalLimit = MAX_TOTAL_UNCOMPRESSED_BYTES } = {}) {
  const reader = stream.getReader();
  const chunks = [];
  let entrySize = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
      const nextEntrySize = entrySize + chunk.byteLength;
      const nextTotalSize = totalState.total + chunk.byteLength;
      if (nextEntrySize > entryLimit || nextTotalSize > totalLimit) {
        await reader.cancel("Workbook decompression limit exceeded");
        const limitName = nextEntrySize > entryLimit ? `ZIP entry ${fileName}` : "Workbook uncompressed content";
        const limit = nextEntrySize > entryLimit ? entryLimit : totalLimit;
        throw new Error(`${limitName} exceeds the ${Math.round(limit / (1024 * 1024))} MB decompression limit.`);
      }
      chunks.push(chunk);
      entrySize = nextEntrySize;
      totalState.total = nextTotalSize;
    }
  } finally {
    reader.releaseLock();
  }

  const output = new Uint8Array(entrySize);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return output;
}

async function inflateRaw(data, expectedSize = 0, fileName = "workbook entry", totalState = { total: 0 }, limits = {}) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const inflated = await readStreamWithLimits(stream, { fileName, totalState, ...limits });
  if (expectedSize && inflated.length !== expectedSize) {
    throw new Error(`Workbook ZIP entry ${fileName} decompressed to an unexpected size.`);
  }
  return inflated;
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
  const supportError = workbookSupportError();
  if (supportError) {
    throw new Error(supportError);
  }

  const bytes = new Uint8Array(arrayBuffer);
  if (bytes.length > MAX_WORKBOOK_BYTES) {
    throw new Error(`Workbook is too large. Maximum supported upload size is ${Math.round(MAX_WORKBOOK_BYTES / (1024 * 1024))} MB.`);
  }
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
  if (totalEntries > MAX_ZIP_ENTRIES) {
    throw new Error(`Workbook contains too many ZIP entries (${totalEntries}). Maximum supported entry count is ${MAX_ZIP_ENTRIES}.`);
  }
  let directoryOffset = readUint32LE(view, eocdOffset + 16);
  const entries = new Map();
  let totalUncompressedSize = 0;
  const actualUncompressedState = { total: 0 };

  for (let index = 0; index < totalEntries; index += 1) {
    if (directoryOffset + 46 > bytes.length) {
      throw new Error("Workbook ZIP central directory is truncated.");
    }
    if (readUint32LE(view, directoryOffset) !== centralSignature) {
      throw new Error("Corrupt ZIP central directory entry in workbook.");
    }

    const compressionMethod = readUint16LE(view, directoryOffset + 10);
    const compressedSize = readUint32LE(view, directoryOffset + 20);
    const uncompressedSize = readUint32LE(view, directoryOffset + 24);
    const fileNameLength = readUint16LE(view, directoryOffset + 28);
    const extraLength = readUint16LE(view, directoryOffset + 30);
    const commentLength = readUint16LE(view, directoryOffset + 32);
    const localHeaderOffset = readUint32LE(view, directoryOffset + 42);
    if (uncompressedSize > MAX_ZIP_ENTRY_BYTES) {
      throw new Error(`Workbook ZIP entry exceeds the per-entry size limit: ${decodeText(bytes.slice(directoryOffset + 46, directoryOffset + 46 + fileNameLength)) || "unknown entry"}.`);
    }
    totalUncompressedSize += uncompressedSize;
    if (totalUncompressedSize > MAX_TOTAL_UNCOMPRESSED_BYTES) {
      throw new Error(`Workbook uncompressed content exceeds the ${Math.round(MAX_TOTAL_UNCOMPRESSED_BYTES / (1024 * 1024))} MB limit.`);
    }
    const fileNameBytes = bytes.slice(directoryOffset + 46, directoryOffset + 46 + fileNameLength);
    const fileName = decodeText(fileNameBytes);

    if (localHeaderOffset + 30 > bytes.length) {
      throw new Error(`Corrupt ZIP local header for ${fileName}.`);
    }
    if (readUint32LE(view, localHeaderOffset) !== localSignature) {
      throw new Error(`Corrupt ZIP local header for ${fileName}.`);
    }

    const localNameLength = readUint16LE(view, localHeaderOffset + 26);
    const localExtraLength = readUint16LE(view, localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    if (dataOffset + compressedSize > bytes.length) {
      throw new Error(`Workbook ZIP entry ${fileName} is truncated.`);
    }
    const compressedBytes = bytes.slice(dataOffset, dataOffset + compressedSize);

    let contentBytes;
    if (compressionMethod === 0) {
      contentBytes = compressedBytes;
      if (uncompressedSize && contentBytes.length !== uncompressedSize) {
        throw new Error(`Workbook ZIP entry ${fileName} has an unexpected stored size.`);
      }
    } else if (compressionMethod === 8) {
      contentBytes = await inflateRaw(compressedBytes, uncompressedSize, fileName, actualUncompressedState);
    } else {
      throw new Error(`Unsupported workbook compression method ${compressionMethod} for ${fileName}.`);
    }

    if (contentBytes.length > MAX_ZIP_ENTRY_BYTES) {
      throw new Error(`Workbook ZIP entry ${fileName} is too large after decompression.`);
    }
    if (compressionMethod === 0) {
      const nextActualTotal = actualUncompressedState.total + contentBytes.length;
      if (nextActualTotal > MAX_TOTAL_UNCOMPRESSED_BYTES) {
        throw new Error(`Workbook uncompressed content exceeds the ${Math.round(MAX_TOTAL_UNCOMPRESSED_BYTES / (1024 * 1024))} MB limit.`);
      }
      actualUncompressedState.total = nextActualTotal;
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
    return target ? { name, state: sheet.getAttribute("state") || "visible", target: target.startsWith("/") ? target.replace(/^\//, "") : concatPath("xl/workbook.xml", target) } : null;
  }).filter(Boolean);
}

function parseWorkbookDate1904(entries) {
  const workbookBytes = entries.get("xl/workbook.xml");
  if (!workbookBytes) {
    return false;
  }
  const workbookDoc = xmlDocument(workbookBytes);
  const workbookPr = [...workbookDoc.getElementsByTagNameNS("*", "workbookPr")][0];
  return workbookPr?.getAttribute("date1904") === "1";
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

function normalizeSheetCellValue(header, value, { date1904 = false } = {}) {
  const field = HEADER_TO_FIELD[normalizeHeader(header)];
  if (field === "released") {
    return excelSerialToDateOnly(value, date1904) || normalizeString(value);
  }
  if (field === "license_start") {
    return excelSerialToUtcDateTime(value, "start", date1904) || normalizeString(value);
  }
  if (field === "license_end") {
    return excelSerialToUtcDateTime(value, "end", date1904) || normalizeString(value);
  }
  return normalizeString(value);
}

function extractHeaderAndRecords(rawRows, workbookOptions = {}) {
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
      const value = normalizeSheetCellValue(header, values.get(columnIndex), workbookOptions);
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

function classifyTemplateVersion(headers = []) {
  const normalized = new Set(headers.map(normalizeHeader).filter(Boolean));
  const has = (...names) => names.every((name) => normalized.has(name));
  if (DIRECT_COLUMNS.every((header) => normalized.has(normalizeHeader(header)))) return "v2.2.0";
  if (has("assettype", "externalid", "title", "languagetag")) return "v1.2";
  if (has("assettype", "externalid", "title", "trailersource")) return "v1.3-v1.5.4";
  if (has("assettype", "externalid", "title", "seasonepnumber", "videoprofile") && !normalized.has("parenttype")) return "v1.0/v1.1";
  if (has("assettype", "externalid", "title", "videoprofile")) return "v2.0.2-v2.1.2";
  if (has("assettype", "externalid", "title")) return "v1.0/v1.1";
  return "legacy/unknown";
}

async function parseXlsxRows(file, preferredSheetName = "") {
  assertWorkbookFile(file);
  const entries = await unzipEntries(await file.arrayBuffer());
  const sheets = parseWorkbookSheets(entries);
  const date1904 = parseWorkbookDate1904(entries);
  if (!sheets.length) {
    throw new Error("No sheets found in workbook.");
  }

  let selectedSheet = sheets.find((sheet) => sheet.state === "visible" && !/^_(meta|lists)$/i.test(sheet.name)) || sheets[0];
  if (normalizeString(preferredSheetName)) {
    const found = sheets.find((sheet) => sheet.name.toLowerCase() === preferredSheetName.toLowerCase());
    if (found) {
      selectedSheet = found;
    }
  }

  const sharedStrings = parseSharedStrings(entries);
  const rawRows = parseSheetRows(entries, selectedSheet.target, sharedStrings);
  const extracted = extractHeaderAndRecords(rawRows, { date1904 });
  const metaSheet = sheets.find((sheet) => /^_meta$/i.test(sheet.name));
  let templateVersion = "";
  if (metaSheet) {
    const meta = extractHeaderAndRecords(parseSheetRows(entries, metaSheet.target, sharedStrings), { date1904 });
    meta.records.forEach((row) => {
      const key = normalizeString(row.key || row.Key || row.name || row.Name).toLowerCase();
      if (key === "template_version") templateVersion = normalizeString(row.value || row.Value || row.template_version);
    });
  }
  if (!templateVersion) templateVersion = classifyTemplateVersion(extracted.headers);
  const unsupportedHeaders = extracted.headers.filter((header) => {
    if (!header || HEADER_TO_FIELD[normalizeHeader(header)]) return false;
    return extracted.records.some((row) => normalizeString(row[header]));
  });

  return {
    sheetName: selectedSheet.name,
    headers: extracted.headers,
    rows: extracted.records,
    rowNumbers: extracted.rowNumbers,
    rowCells: extracted.rowCells,
    headerCells: extracted.headerCells,
    templateVersion,
    unsupportedHeaders,
  };
}

async function convertBulk() {
  const fileInput = byId("bulk-file");
  const file = fileInput.files && fileInput.files[0];
  if (!file) {
    const message = "Choose a .xlsx file first.";
    renderBlockedPreflight([message], [], "bulk");
    setStatus(message, "error");
    return;
  }

  const documentName = normalizeDocumentNameInput(byId("bulk-name"), "AxinomBulkIngest");
  const nameError = formatDocumentNameError(documentName);
  if (nameError) {
    renderBlockedPreflight([nameError], [], "bulk");
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
      templateVersion: parsed.templateVersion,
      unsupportedHeaders: parsed.unsupportedHeaders,
    });

    if (result.document) {
      updateDocumentMetaDisplay("bulk", result.document.document_created);
      renderDocument(result.document, result.preflight, "bulk");
      setCurrentDownloadName(result.document.name || documentName);
    }

    if (!result.ok) {
      renderBlockedPreflight(result.errors.flatMap((entry) => entry.errors || []), result.warnings, "bulk");
      setStatus(formatErrors(result), "error");
      return;
    }

    const summary = `Converted ${result.stats.items_created || 0} item(s) from ${result.stats.rows_read || 0} row(s) on sheet '${result.stats.sheet || ""}' (${parsed.templateVersion || "legacy/unknown"}; generated IDs: ${result.stats.generated_ids || 0}; defaulted profiles: ${result.stats.defaulted_profiles || 0}; preserved legacy profiles: ${result.stats.preserved_legacy_profiles || 0}).`;
    if (result.warnings.length) {
      setStatus(`${summary} Warning(s): ${result.warnings.join(" | ")}`, "warn");
      return;
    }
    setStatus(summary, "ok");
  } catch (error) {
    renderBlockedPreflight([`Excel conversion failed: ${error.message}`], [], "bulk");
    setStatus(`Excel conversion failed: ${error.message}`, "error");
  }
}

function bindEvents() {
  const appIcon = byId("app-icon");
  if (appIcon) {
    appIcon.addEventListener("error", () => {
      appIcon.hidden = true;
    });
  }

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
    button.addEventListener("keydown", handleTabKeydown);
  });

  byId("theme-toggle").addEventListener("click", toggleTheme);

  byId("field-program_type").addEventListener("change", () => {
    renderStaleOutput("single");
    updateRequiredHint();
    updateVisibleFields();
    syncSingleDocumentMetadata();
    updateSingleGeneratedId();
  });
  byId("single-ingest-mode").addEventListener("change", () => {
    renderStaleOutput("single");
    updateRequiredHint();
    updateVisibleFields();
  });

  ["field-title", "field-series_hint", "field-season_index", "field-episode_index", "field-studio", "field-parent_type", "field-parent_external_id", "field-external_id"].forEach((id) => {
    byId(id).addEventListener("input", () => {
      renderStaleOutput("single");
      syncSingleDocumentMetadata();
      updateSingleGeneratedId();
    });
    byId(id).addEventListener("change", () => {
      renderStaleOutput("single");
      updateSingleGeneratedId();
    });
  });

  byId("single-name").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    renderStaleOutput("single");
    state.singleNameDirty = Boolean(normalizeString(byId("single-name").value));
    if (!state.singleNameDirty) {
      syncSingleDocumentMetadata();
    }
    setCurrentDownloadName(byId("single-name").value || "AxinomIngest");
  });

  byId("single-description").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    renderStaleOutput("single");
    state.singleDescriptionDirty = Boolean(normalizeString(byId("single-description").value));
    if (!state.singleDescriptionDirty) {
      syncSingleDocumentMetadata();
    }
    updateAllDescriptionCounters();
  });

  byId("field-description").addEventListener("input", () => {
    renderStaleOutput("single");
    updateAllDescriptionCounters();
  });

  const handledSingleFieldIds = new Set(["field-program_type", "field-description", "field-title", "field-series_hint", "field-season_index", "field-episode_index", "field-studio", "field-parent_type", "field-parent_external_id", "field-external_id"]);
  document.querySelectorAll("#tab-single [data-field] input, #tab-single [data-field] select, #tab-single [data-field] textarea").forEach((control) => {
    if (handledSingleFieldIds.has(control.id)) return;
    ["input", "change"].forEach((eventName) => control.addEventListener(eventName, () => renderStaleOutput("single")));
  });

  byId("bulk-name").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    renderStaleOutput("bulk");
    state.bulkNameDirty = Boolean(normalizeString(byId("bulk-name").value));
  });

  byId("bulk-description").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    renderStaleOutput("bulk");
    state.bulkDescriptionDirty = Boolean(normalizeString(byId("bulk-description").value));
    updateAllDescriptionCounters();
  });

  byId("bulk-file").addEventListener("change", () => {
    renderStaleOutput("bulk");
    updateBulkImportAvailability();
    void syncBulkDocumentMetadata();
  });

  byId("bulk-sheet").addEventListener("input", () => {
    renderStaleOutput("bulk");
    void syncBulkDocumentMetadata();
  });

  byId("direct-name").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    renderStaleOutput("direct");
    state.directNameDirty = Boolean(normalizeString(byId("direct-name").value));
  });

  byId("direct-description").addEventListener("input", () => {
    if (state.autoSyncingDocumentMetadata) {
      return;
    }
    renderStaleOutput("direct");
    state.directDescriptionDirty = Boolean(normalizeString(byId("direct-description").value));
    updateAllDescriptionCounters();
  });

  byId("build-single").addEventListener("click", generateSingle);
  byId("clear-single").addEventListener("click", clearSingle);
  byId("convert-bulk").addEventListener("click", () => { void convertBulk(); });
  byId("download-template-bulk").addEventListener("click", () => renderTemplateDownload(byId("bulk-template-version").value));
  byId("add-direct-row").addEventListener("click", () => {
    renderStaleOutput("direct");
    appendDirectRow();
  });
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
  renderDataList("country-code-list", COMMON_COUNTRY_CODES);
  updateSingleVideoProfileOptions();
  buildDirectTable();
  bindEvents();
  updateBulkImportAvailability();
  updateAllDocumentMetaDisplays();
  syncSingleDocumentMetadata(true);
  void syncBulkDocumentMetadata(true);
  syncDirectDocumentMetadata(true);
  updateAllDescriptionCounters();
  updateRequiredHint();
  updateVisibleFields();
  updateSingleGeneratedId();
  renderDocument(null);
  setStatus("Ready.");
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  init();
}

if (typeof module !== "undefined") {
  module.exports = {
    APP_RELEASE_LABEL,
    HELPER_VERSION,
    DOCUMENT_NAME_MAX_LENGTH,
    DESCRIPTION_WARN_LENGTH,
    MAX_WORKBOOK_BYTES,
    MAX_ZIP_ENTRIES,
    MAX_ZIP_ENTRY_BYTES,
    MAX_TOTAL_UNCOMPRESSED_BYTES,
    PROGRAM_TYPES,
    PROGRAM_TYPE_CONFIG,
    DEFAULT_VIDEO_PROFILE,
    ACTIVE_VIDEO_PROFILES,
    LEGACY_VIDEO_PROFILES,
    VIDEO_PROFILES,
    TEMPLATE_FILES,
    assertWorkbookFile,
    buildDocumentName,
    buildItem,
    boundDetailedMessages,
    descriptionWarning,
    formatDocumentNameError,
    inflateRaw,
    mapRowToFields,
    normalizeGuidComponent,
    normalizeProgramType,
    parseDateTimeToUtcString,
    parseDateValue,
    preflightDocument,
    readStreamWithLimits,
    rowsToDocument,
    resolveExternalId,
    resolveStudioProvider,
    generateExternalId,
    classifyTemplateVersion,
    validateEpisodeExternalId,
    profileForFields,
    requiredFieldsForSingle,
    sanitizeDocumentName,
    summarizeWarnings,
    suggestDocumentMetadataForFields,
    workbookSupportError,
  };
}
