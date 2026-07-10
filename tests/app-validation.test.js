const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const app = require("../site/app.js");

const repoRoot = path.resolve(__dirname, "..");

function validFieldsFor(type) {
  const base = { program_type: type, external_id: `${type}_001` };
  if (["MOVIE", "TVSHOW", "PODCAST"].includes(type)) {
    return { ...base, title: `${type} Title` };
  }
  if (type === "SEASON") {
    return { ...base, index: "1", parent_external_id: "TVSHOW_001" };
  }
  if (type === "EPISODE") {
    return { ...base, title: "Episode Title", index: "1", parent_external_id: "SEASON_001" };
  }
  if (type === "TRAILER") {
    return { ...base, title: "Trailer Title", parent_type: "MOVIE", parent_external_id: "MOVIE_001" };
  }
  if (type === "EXTRA") {
    return { ...base, title: "Extra Title", parent_type: "TVSHOW", parent_external_id: "TVSHOW_001" };
  }
  return base;
}

assert.equal(app.APP_RELEASE_LABEL, "v2.1.1");
assert.equal(app.HELPER_VERSION, "v2.1.1");
assert.equal(app.TEMPLATE_FILES.current, "docs/reference/axinom_ingest_template_v2_1_1.xlsx");
assert.ok(fs.existsSync(path.join(repoRoot, app.TEMPLATE_FILES.current)));
assert.deepEqual(app.VIDEO_PROFILES, [
  "CMAF_File_Non-DRM",
  "HLS-DASH_DRM",
  "LAS_CMAF_File_Non-DRM",
  "LAS_HLS-DASH_DRM",
]);

assert.deepEqual(app.PROGRAM_TYPES, ["MOVIE", "TVSHOW", "PODCAST", "SEASON", "EPISODE", "TRAILER", "EXTRA"]);
app.PROGRAM_TYPES.forEach((type) => {
  const result = app.buildItem(validFieldsFor(type));
  assert.equal(result.errors.length, 0, `${type} should build with required fields`);
  assert.equal(result.item.type, type);
});

const podcast = app.buildItem(validFieldsFor("PODCAST"));
assert.equal(podcast.errors.length, 0);
assert.ok(podcast.warnings.some((warning) => warning.includes("experimental")));

const episodeMissingIndex = app.buildItem({
  program_type: "EPISODE",
  external_id: "E001",
  title: "Episode",
  parent_external_id: "S001",
});
assert.ok(episodeMissingIndex.errors.includes("Missing required field: index"));

const invalidReleased = app.buildItem({
  program_type: "MOVIE",
  external_id: "M_BAD_DATE",
  title: "Bad Date",
  released: "2026-99-99",
});
assert.ok(invalidReleased.errors.includes("Field 'released' must be a valid date"));
assert.equal(app.parseDateValue("2026-99-99"), "");

const invalidLicenseStart = app.buildItem({
  program_type: "MOVIE",
  external_id: "M_BAD_LICENSE",
  title: "Bad License",
  license_start: "not a date",
});
assert.ok(invalidLicenseStart.errors.includes("Field 'license_start' must be a valid date/time"));
assert.equal(app.parseDateTimeToUtcString("2026-99-99T21:00+00:00"), "");

const duplicateRows = app.rowsToDocument({
  documentName: "Duplicate_Test",
  rows: [
    { "Asset Type": "MOVIE", "External ID": "M_DUP", Title: "First" },
    { "Asset Type": "MOVIE", "External ID": "M_DUP", Title: "Second" },
  ],
  rowNumbers: [2, 3],
  rowCells: [
    { "Asset Type": "A2", "External ID": "B2", Title: "C2" },
    { "Asset Type": "A3", "External ID": "B3", Title: "C3" },
  ],
});
assert.equal(duplicateRows.ok, false);
assert.ok(duplicateRows.errors[0].errors[0].startsWith("Error at B3: Duplicate External ID"));

const missingEpisodeIndex = app.rowsToDocument({
  documentName: "Episode_Test",
  rows: [{ "Asset Type": "EPISODE", "External ID": "E001", Title: "Episode", "Parent External ID": "S001" }],
  rowNumbers: [12],
  rowCells: [{ "Asset Type": "A12", "External ID": "B12", Title: "C12", "Season/Ep Number": "I12", "Parent External ID": "K12" }],
});
assert.equal(missingEpisodeIndex.ok, false);
assert.ok(missingEpisodeIndex.errors[0].errors.includes("Error at I12: Episodes must have a number"));

const podcastRows = app.rowsToDocument({
  documentName: "Podcast_Test",
  rows: [{ "Asset Type": "PODCAST", "External ID": "P001", Title: "Podcast" }],
});
assert.equal(podcastRows.ok, true);
assert.equal(podcastRows.document.items[0].type, "PODCAST");
assert.ok(podcastRows.warnings.some((warning) => warning.includes("experimental")));

assert.equal(app.descriptionWarning("x".repeat(151)).includes("151/150"), true);
assert.equal(
  app.sanitizeDocumentName("God's Not Dead: In God We Trust_Movie Ingest"),
  "GodsNotDeadInGodWeTrust_MovieIngest",
);
const longEpisodeName = app.buildDocumentName("Superbook Christian Broadcasting Network International Long Title", "S03 E10 Ingest");
assert.ok(longEpisodeName.length <= app.DOCUMENT_NAME_MAX_LENGTH);
assert.ok(longEpisodeName.endsWith("_S03_E10_Ingest"));
assert.equal(app.formatDocumentNameError("Bad Name"), "Document Name may only contain letters, numbers, and underscores.");

assert.throws(
  () => app.assertWorkbookFile({ name: "large.xlsx", size: app.MAX_WORKBOOK_BYTES + 1 }),
  /Workbook is too large/,
);
assert.throws(
  () => app.assertWorkbookFile({ name: "legacy.xls", size: 1 }),
  /must be an \.xlsx file/,
);

const html = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
assert.match(html, /role="tablist"/);
assert.match(html, /role="tab"/);
assert.match(html, /aria-selected="true"/);
assert.match(html, /id="preflight"/);
assert.match(html, /aria-live="polite"/);
assert.doesNotMatch(html, /onerror=/i);

console.log("app-validation tests passed");
