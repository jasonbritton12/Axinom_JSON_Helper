"""Core conversion logic for Axinom ingest JSON generation."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

DOCUMENT_NAME_MAX_LENGTH = 50


HEADER_TO_FIELD = {
    "assettype": "program_type",
    "programtype": "program_type",
    "externalid": "external_id",
    "guid": "external_id",
    "series": "series_hint",
    "id": "platform_id",
    "titlealternateid": "external_id",
    "title": "title",
    "originaltitle": "original_title",
    "description": "description",
    "synopsis": "synopsis",
    "releaseddate": "released",
    "pubdate": "released",
    "year": "released",
    "studio": "studio",
    "seasonepnumber": "index",
    "seasonnumber": "season_index",
    "episodenumber": "episode_index",
    "parenttype": "parent_type",
    "parentexternalid": "parent_external_id",
    "genres": "genres",
    "tags": "tags",
    "cast": "cast",
    "productioncountries": "production_countries",
    "countryoforigin": "production_countries",
    "licensestartutc": "license_start",
    "availabledate": "license_start",
    "licenseendutc": "license_end",
    "expirationdate": "license_end",
    "licensecountries": "license_countries",
    "availabilitylabels": "license_countries",
    "videosource": "video_source",
    "videoprofile": "video_profile",
    "coverimage": "cover_image",
    "teaserimage": "teaser_image",
    "language": "language_tag",
    "languagetag": "language_tag",
    "localizedtitle": "localized_title",
    "localizeddescription": "localized_description",
    "localizedsynopsis": "localized_synopsis",
    "trailersource": "trailer_source",
    "trailerprofile": "trailer_profile",
}


DATE_FORMATS = [
    "%Y-%m-%d",
    "%Y/%m/%d",
    "%m/%d/%Y",
    "%m/%d/%y",
    "%Y",
]

DATETIME_FORMATS = [
    "%Y-%m-%d %I:%M %p",
    "%Y-%m-%d %H:%M",
    "%Y-%m-%dT%H:%M",
    "%Y/%m/%d %I:%M %p",
    "%Y/%m/%d %H:%M",
    "%m/%d/%Y %I:%M %p",
    "%m/%d/%Y %H:%M",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%dT%H:%M:%S.%f",
]


@dataclass
class ItemBuildResult:
    item: Optional[Dict[str, Any]]
    errors: List[str]
    warnings: List[str]


class IngestConverter:
    def __init__(self, config_path: Path) -> None:
        self.config_path = Path(config_path)
        self.config = json.loads(self.config_path.read_text(encoding="utf-8"))

    def helper_version(self) -> str:
        version = _clean_text(self.config.get("version"))
        if not version:
            return "unknown"
        return version if version.startswith("v") else f"v{version}"

    def supported_program_types(self) -> List[str]:
        return list(self.config["program_types"].keys())

    def required_fields_by_program_type(self) -> Dict[str, List[str]]:
        return {
            key: value.get("required", [])
            for key, value in self.config["program_types"].items()
        }

    def allowed_parent_types_by_program_type(self) -> Dict[str, List[str]]:
        return {
            key: value.get("allowed_parent_types", [])
            for key, value in self.config["program_types"].items()
        }

    def normalize_program_type(self, value: Any) -> str:
        raw = _clean_text(value).upper()
        if raw in self.config["program_types"]:
            return raw

        aliases = self.config.get("type_aliases", {})
        return aliases.get(raw, raw)

    def form_payload_to_document(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        document_name = _clean_text(payload.get("name"))
        document_description = _clean_text(payload.get("description"))
        fields = payload.get("fields") or {}

        build_result = self._build_item(fields)
        if build_result.errors:
            return {
                "ok": False,
                "errors": build_result.errors,
                "warnings": build_result.warnings,
            }

        suggested_name, suggested_description = _suggest_single_document_metadata(
            fields,
            normalized_type=self.normalize_program_type(fields.get("program_type")),
        )
        effective_name = document_name or suggested_name or "Axinom Ingest"
        name_error = _validate_document_name(effective_name)
        if name_error:
            return {
                "ok": False,
                "errors": [name_error],
                "warnings": build_result.warnings,
            }

        document: Dict[str, Any] = {"name": effective_name}

        effective_description = document_description or suggested_description
        if effective_description:
            document["description"] = effective_description

        document["items"] = [build_result.item]
        document["document_created"] = _current_document_created()
        document["helper_version"] = self.helper_version()

        return {
            "ok": True,
            "document": document,
            "warnings": build_result.warnings,
            "errors": [],
        }

    def rows_to_document(
        self,
        rows: List[Dict[str, str]],
        document_name: str,
        source_name: str,
        sheet_name: str,
        document_description: str = "",
        document_created: str = "",
        row_numbers: Optional[List[int]] = None,
        row_cells: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        items: List[Dict[str, Any]] = []
        warnings: List[str] = []
        row_errors: List[Dict[str, Any]] = []

        for idx, row in enumerate(rows):
            sheet_row_number = (
                row_numbers[idx]
                if row_numbers and idx < len(row_numbers)
                else idx + 2
            )
            sheet_row_cells = row_cells[idx] if row_cells and idx < len(row_cells) else {}
            fields = self._map_row_to_fields(row)

            # Skip purely empty rows.
            if not any(_clean_text(v) for v in fields.values()):
                continue

            build_result = self._build_item(fields)
            if build_result.errors:
                normalized_type = self.normalize_program_type(fields.get("program_type"))
                formatted_errors = [
                    _format_sheet_error_message(
                        error,
                        row_number=sheet_row_number,
                        row_cells=sheet_row_cells,
                        normalized_program_type=normalized_type,
                    )
                    for error in build_result.errors
                ]
                row_errors.append(
                    {
                        "row": sheet_row_number,
                        "errors": formatted_errors,
                        "raw_row": row,
                    }
                )
                continue

            items.append(build_result.item)
            for warning in build_result.warnings:
                warnings.append(f"Row {sheet_row_number}: {warning}")

        overall_ok = len(items) > 0 and len(row_errors) == 0

        document_name = _clean_text(document_name) or "Axinom Ingest"
        name_error = _validate_document_name(document_name)
        if name_error:
            row_errors.append(
                {
                    "row": 0,
                    "errors": [name_error],
                    "raw_row": {},
                }
            )
            overall_ok = False

        if not overall_ok and not row_errors:
            row_errors.append(
                {
                    "row": 0,
                    "errors": ["No ingest rows found in spreadsheet."],
                    "raw_row": {},
                }
            )

        document = {"name": document_name} if items and not row_errors else None
        if document:
            description = _clean_text(document_description)
            if description:
                document["description"] = description
            document["items"] = items
            document["document_created"] = _current_document_created()
            document["helper_version"] = self.helper_version()

        return {
            "ok": overall_ok,
            "document": document,
            "errors": row_errors,
            "warnings": warnings,
            "stats": {
                "source": source_name,
                "sheet": sheet_name,
                "rows_read": len(rows),
                "items_created": len(items),
                "rows_failed": len(row_errors),
            },
        }

    def _map_row_to_fields(self, row: Dict[str, str]) -> Dict[str, str]:
        mapped: Dict[str, str] = {}
        external_candidates: List[Tuple[str, str]] = []

        for header, value in row.items():
            normalized_header = _normalize_header(header)
            field = HEADER_TO_FIELD.get(normalized_header)
            if not field:
                continue

            cleaned = _clean_text(value)
            if not cleaned:
                continue

            if field == "external_id":
                external_candidates.append((normalized_header, cleaned))
                continue

            # Keep first useful value when multiple headers map to the same field.
            if field not in mapped or not mapped[field]:
                mapped[field] = cleaned

        mapped["external_id"] = _pick_external_id(external_candidates)

        program_type = self.normalize_program_type(mapped.get("program_type"))
        if program_type == "EPISODE":
            mapped["index"] = _clean_text(mapped.get("episode_index")) or _clean_text(mapped.get("index"))
        elif program_type == "SEASON":
            mapped["index"] = _clean_text(mapped.get("season_index")) or _clean_text(mapped.get("index"))
        else:
            mapped["index"] = _clean_text(mapped.get("index"))

        # If year-only field was provided, convert to release date at Jan 1.
        if mapped.get("released") and re.fullmatch(r"\d{4}", mapped["released"]):
            mapped["released"] = f"{mapped['released']}-01-01"

        return mapped

    def _build_item(self, fields: Dict[str, Any]) -> ItemBuildResult:
        errors: List[str] = []
        warnings: List[str] = []

        normalized_type = self.normalize_program_type(fields.get("program_type"))
        type_config = self.config["program_types"].get(normalized_type)

        if not type_config:
            return ItemBuildResult(
                item=None,
                errors=[
                    (
                        "Unsupported program type "
                        f"'{_clean_text(fields.get('program_type'))}'. "
                        f"Supported values: {', '.join(self.supported_program_types())}."
                    )
                ],
                warnings=[],
            )

        ingest_type = type_config["ingest_type"]
        external_id = _clean_text(fields.get("external_id"))
        parent_type = self.normalize_program_type(fields.get("parent_type"))
        allowed_parent_types = type_config.get("allowed_parent_types") or []
        data = _build_data(fields)

        localized_present = any(
            _clean_text(fields.get(key))
            for key in ("localized_title", "localized_description", "localized_synopsis")
        )
        if localized_present and not _clean_text(fields.get("language_tag")):
            errors.append("Field 'language_tag' is required when localized fields are provided")

        if ingest_type in {"TVSHOW", "SEASON"}:
            data.pop("main_video", None)
        if ingest_type == "TRAILER":
            data.pop("trailers", None)

        main_video = data.get("main_video") or {}
        if "profile" in main_video and "source" not in main_video:
            errors.append("Field 'main_video.source' is required when 'main_video.profile' is set")

        for trailer in data.get("trailers") or []:
            if "profile" in trailer and "source" not in trailer:
                errors.append("Field 'trailers[].source' is required when 'trailers[].profile' is set")

        if parent_type and parent_type not in self.supported_program_types():
            errors.append(
                "Field 'parent_type' must be one of: "
                f"{', '.join(self.supported_program_types())}"
            )
        elif allowed_parent_types and parent_type and parent_type not in allowed_parent_types:
            errors.append(
                "Field 'parent_type' must be one of: "
                f"{', '.join(allowed_parent_types)}"
            )

        if "parent_external_id" not in data:
            derived_parent = _derive_parent_external_id(external_id, ingest_type)
            if derived_parent:
                data["parent_external_id"] = derived_parent
                warnings.append("Derived parent_external_id from external_id")

        for required_field in type_config.get("required", []):
            if required_field == "external_id":
                if not external_id:
                    errors.append("Missing required field: external_id")
                continue

            if required_field == "index":
                if "index" not in data:
                    errors.append("Missing required field: index")
                continue

            if required_field == "parent_type":
                if not parent_type:
                    errors.append("Missing required field: parent_type")
                continue

            value = data.get(required_field)
            if value in (None, "", []):
                errors.append(f"Missing required field: {required_field}")

        if "index" in data:
            try:
                index_value = int(data["index"])
                if index_value < 1:
                    raise ValueError
                data["index"] = index_value
            except (ValueError, TypeError):
                errors.append("Field 'index' must be an integer greater than 0")

        notes = type_config.get("notes") or []
        warnings.extend(notes)

        # Preserve the original user type in tags for mapped pseudo-types.
        if normalized_type != ingest_type:
            tags = data.get("tags") or []
            marker = f"program_type:{normalized_type.lower()}"
            if marker not in tags:
                tags.append(marker)
            data["tags"] = tags

        if not data:
            errors.append("No metadata values were provided for data payload")

        if errors:
            return ItemBuildResult(item=None, errors=errors, warnings=warnings)

        return ItemBuildResult(
            item={
                "type": ingest_type,
                "external_id": external_id,
                "data": data,
            },
            errors=[],
            warnings=warnings,
        )


def _normalize_header(header: str) -> str:
    return re.sub(r"[^a-z0-9]", "", _clean_text(header).lower())


def _pick_external_id(candidates: List[Tuple[str, str]]) -> str:
    if not candidates:
        return ""

    # Prefer direct template IDs, then GUID-like IDs, then fallbacks.
    priority = {
        "externalid": 0,
        "titlealternateid": 1,
        "guid": 2,
        "series": 3,
        "id": 4,
    }

    ranked = sorted(candidates, key=lambda pair: priority.get(pair[0], 99))
    best_header, best_value = ranked[0]

    # If GUID is numeric and Series has a likely external ID, prefer Series.
    if best_header == "guid" and best_value.isdigit():
        for header, value in ranked:
            if header == "series" and re.search(r"[A-Za-z]", value) and "_" in value:
                return value

    return best_value


def _sheet_error_field_candidates(field: str) -> List[str]:
    mapping = {
        "program_type": ["assettype", "programtype"],
        "external_id": ["externalid", "titlealternateid", "guid", "series", "id"],
        "title": ["title"],
        "index": ["seasonepnumber", "episodenumber", "seasonnumber"],
        "parent_type": ["parenttype"],
        "parent_external_id": ["parentexternalid"],
        "language_tag": ["languagetag", "language"],
        "video_source": ["videosource"],
        "trailer_source": ["trailersource"],
    }
    return mapping.get(field, [field])


def _sheet_error_cell_ref(field: str, row_cells: Dict[str, str]) -> str:
    if not row_cells:
        return ""

    normalized_to_cells: List[Tuple[str, str]] = [
        (_normalize_header(header), cell_ref)
        for header, cell_ref in row_cells.items()
        if header
    ]

    for candidate in _sheet_error_field_candidates(field):
        for normalized_header, cell_ref in normalized_to_cells:
            if normalized_header == candidate:
                return cell_ref

    return ""


def _type_noun(normalized_program_type: str, plural: bool = True) -> str:
    singular = {
        "MOVIE": "Movie",
        "TVSHOW": "TV show",
        "SEASON": "Season",
        "EPISODE": "Episode",
        "TRAILER": "Trailer",
        "EXTRA": "Extra",
    }
    base = singular.get(normalized_program_type, "Item")
    if not plural:
        return base
    if base.endswith("s"):
        return base
    return f"{base}s"


def _format_sheet_error_message(
    error: str,
    *,
    row_number: int,
    row_cells: Dict[str, str],
    normalized_program_type: str,
) -> str:
    field = ""
    message = error

    if error.startswith("Missing required field: "):
        field = error.split(": ", 1)[1].strip()
        if field == "external_id":
            message = "External ID is required"
        elif field == "title":
            message = f"{_type_noun(normalized_program_type)} must have a title"
        elif field == "index":
            message = f"{_type_noun(normalized_program_type)} must have a number"
        elif field == "parent_type":
            message = f"{_type_noun(normalized_program_type)} must have a parent type"
        elif field == "parent_external_id":
            message = f"{_type_noun(normalized_program_type)} must have a parent external ID"
        else:
            message = error
    elif error == "Field 'index' must be an integer greater than 0":
        field = "index"
        message = f"{_type_noun(normalized_program_type)} must have a number greater than 0"
    elif error == "Field 'language_tag' is required when localized fields are provided":
        field = "language_tag"
        message = "Language Tag is required when localized fields are provided"
    elif error == "Field 'main_video.source' is required when 'main_video.profile' is set":
        field = "video_source"
        message = "Video Source is required when Video Profile is set"
    elif error == "Field 'trailers[].source' is required when 'trailers[].profile' is set":
        field = "trailer_source"
        message = "Trailer Source is required when Trailer Profile is set"
    elif error.startswith("Field 'parent_type' must be one of: "):
        field = "parent_type"
        message = error.replace("Field 'parent_type' ", "Parent Type ")
    elif error.startswith("Unsupported program type "):
        field = "program_type"

    cell_ref = _sheet_error_cell_ref(field, row_cells) if field else ""
    if cell_ref:
        return f"Error at {cell_ref}: {message}"
    return f"Error at row {row_number}: {message}"


def _derive_parent_external_id(external_id: str, ingest_type: str) -> str:
    if not external_id:
        return ""

    if ingest_type == "EPISODE":
        # Example: S_county-rescue_xxx_S1_E1 -> S_county-rescue_xxx_S1
        parent = re.sub(r"([_-]E\d+)$", "", external_id, flags=re.IGNORECASE)
        return parent if parent != external_id else ""

    if ingest_type == "SEASON":
        # Example: S_county-rescue_xxx_S1 -> S_county-rescue_xxx
        parent = re.sub(r"([_-]S\d+)$", "", external_id, flags=re.IGNORECASE)
        return parent if parent != external_id else ""

    return ""


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _normalize_document_created(value: Any) -> str:
    text = _clean_text(value)
    if not text:
        return ""

    return _parse_datetime_to_utc_string(text, "start") or text


def _current_document_created() -> str:
    return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000+00:00")


def _pad_index(value: Any) -> str:
    text = _clean_text(value)
    if not text:
        return ""
    try:
        return f"{int(text):02d}"
    except ValueError:
        return text


def _extract_season_index(value: Any) -> str:
    text = _clean_text(value)
    if not text:
        return ""

    matches = re.findall(r"(?:^|[_-])S(\d+)(?=$|[_-])", text, flags=re.IGNORECASE)
    if matches:
        return _pad_index(matches[-1])

    fallback = re.search(r"season\D*(\d+)", text, flags=re.IGNORECASE)
    if fallback:
        return _pad_index(fallback.group(1))

    return ""


def _strip_known_id_prefix(value: str) -> str:
    return re.sub(r"^[A-Z]_", "", value)


def _strip_episode_suffix(value: str) -> str:
    return re.sub(r"([_-])E\d+$", "", value, flags=re.IGNORECASE)


def _strip_season_suffix(value: str) -> str:
    return re.sub(r"([_-])S\d+(?:[_-]E\d+)?$", "", value, flags=re.IGNORECASE)


def _humanize_identifier(value: Any) -> str:
    text = _clean_text(value)
    if not text:
        return ""

    text = _strip_known_id_prefix(text)
    text = _strip_episode_suffix(text)
    text = _strip_season_suffix(text)
    tokens = [part for part in re.split(r"[_-]+", text) if part]
    if not tokens:
        return ""

    words = []
    for token in tokens:
        if token.isdigit():
            words.append(token)
        elif token.isupper() and len(token) <= 4:
            words.append(token)
        else:
            words.append(token.capitalize())
    return " ".join(words)


def _episode_series_label(fields: Dict[str, Any]) -> str:
    parent_external_id = _clean_text(fields.get("parent_external_id"))
    if parent_external_id:
        series_external_id = _strip_season_suffix(parent_external_id)
        return _humanize_identifier(series_external_id or parent_external_id)
    return ""


def _document_subject(fields: Dict[str, Any], normalized_type: str) -> str:
    title = _clean_text(fields.get("title"))
    external_id = _clean_text(fields.get("external_id"))
    parent_external_id = _clean_text(fields.get("parent_external_id"))

    if normalized_type == "MOVIE":
        return title or _humanize_identifier(external_id) or "Movie"

    if normalized_type == "TVSHOW":
        return title or _humanize_identifier(external_id) or "Series"

    if normalized_type == "SEASON":
        return _humanize_identifier(parent_external_id) or title or _humanize_identifier(external_id) or "Series"

    if normalized_type == "EPISODE":
        return _episode_series_label(fields) or title or _humanize_identifier(parent_external_id) or _humanize_identifier(external_id) or "Series"

    if normalized_type in {"TRAILER", "EXTRA"}:
        return title or _humanize_identifier(parent_external_id) or _humanize_identifier(external_id) or normalized_type.title()

    return title or _humanize_identifier(external_id) or "Axinom Ingest"


def _suggest_single_document_metadata(fields: Dict[str, Any], *, normalized_type: str) -> Tuple[str, str]:
    subject = _document_subject(fields, normalized_type)
    index = _pad_index(fields.get("index"))
    season_index = _extract_season_index(fields.get("parent_external_id"))

    if normalized_type == "MOVIE":
        name = _build_document_name(subject, "Movie Ingest")
        description = f"Single-item movie ingest for {subject}."
        return name, description

    if normalized_type == "TVSHOW":
        name = _build_document_name(subject, "TV Show Ingest")
        description = f"Single-item TV show ingest for {subject}."
        return name, description

    if normalized_type == "SEASON":
        suffix = f"S{index}" if index else "Season"
        name = _build_document_name(subject, f"{suffix} Ingest")
        description = f"Single-item season ingest for {subject}{f' season {index}' if index else ''}."
        return name, description

    if normalized_type == "EPISODE":
        if season_index and index:
            label = f"S{season_index} E{index}"
            description = f"Single-item episode ingest for {subject}, season {season_index} episode {index}."
        elif index:
            label = f"Episode {index}"
            description = f"Single-item episode ingest for {subject}, episode {index}."
        else:
            label = "Episode"
            description = f"Single-item episode ingest for {subject}."
        return _build_document_name(subject, f"{label} Ingest"), description

    if normalized_type == "TRAILER":
        return _build_document_name(subject, "Trailer Ingest"), f"Single-item trailer ingest for {subject}."

    if normalized_type == "EXTRA":
        return _build_document_name(subject, "Extra Ingest"), f"Single-item extra ingest for {subject}."

    return _build_document_name(subject, "Ingest"), f"Single-item ingest for {subject}."


def _truncate_with_ellipsis(value: str, max_length: int) -> str:
    if len(value) <= max_length:
        return value
    if max_length <= 3:
        return value[:max_length]
    return f"{value[: max_length - 3].rstrip()}..."


def _build_document_name(subject: str, suffix: str) -> str:
    clean_subject = _clean_text(subject) or "Axinom"
    clean_suffix = _clean_text(suffix) or "Ingest"
    reserved = f" - {clean_suffix}"

    if len(reserved) >= DOCUMENT_NAME_MAX_LENGTH:
        return _truncate_with_ellipsis(f"{clean_subject}{reserved}", DOCUMENT_NAME_MAX_LENGTH)

    truncated_subject = _truncate_with_ellipsis(clean_subject, DOCUMENT_NAME_MAX_LENGTH - len(reserved))
    return f"{truncated_subject}{reserved}"


def _validate_document_name(value: str) -> Optional[str]:
    text = _clean_text(value)
    if not text:
        return "Document Name is required."
    if len(text) > DOCUMENT_NAME_MAX_LENGTH:
        return f"Document Name must be {DOCUMENT_NAME_MAX_LENGTH} characters or fewer."
    return None


def _split_multi(value: Any, *, uppercase: bool = False) -> List[str]:
    text = _clean_text(value)
    if not text:
        return []

    tokens = [chunk.strip() for chunk in re.split(r"[,;\n]", text)]
    values = [token for token in tokens if token]

    if uppercase:
        values = [token.upper() for token in values]

    return values


def _parse_date(value: Any) -> Optional[str]:
    text = _clean_text(value)
    if not text:
        return None

    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", text):
        return text

    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(text, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue

    # If the input includes time, try datetime parse and then strip to date.
    dt = _parse_datetime(text)
    if dt:
        return dt.strftime("%Y-%m-%d")

    return text


def _parse_datetime(value: Any) -> Optional[datetime]:
    text = _clean_text(value)
    if not text:
        return None

    # Support a subset of ISO-8601 forms.
    iso_candidate = text.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(iso_candidate)
        if parsed.tzinfo:
            return parsed.replace(tzinfo=None)
        return parsed
    except ValueError:
        pass

    for fmt in DATETIME_FORMATS:
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue

    return None


def _parse_datetime_to_utc_string(value: Any, boundary: str) -> Optional[str]:
    text = _clean_text(value)
    if not text:
        return None

    if re.fullmatch(r"\d{4}-\d{2}-\d{2}T.*([+-]\d{2}:\d{2}|Z)$", text):
        return text.replace("Z", "+00:00")

    dt = _parse_datetime(text)
    if dt:
        return dt.strftime("%Y-%m-%dT%H:%M:%S.000+00:00")

    date_only = _parse_date(text)
    if date_only:
        if boundary == "start":
            return f"{date_only}T00:00:00.000+00:00"
        return f"{date_only}T23:59:59.999+00:00"

    return text


def _build_data(fields: Dict[str, Any]) -> Dict[str, Any]:
    data: Dict[str, Any] = {}

    title = _clean_text(fields.get("title"))
    original_title = _clean_text(fields.get("original_title"))
    description = _clean_text(fields.get("description"))
    synopsis = _clean_text(fields.get("synopsis"))
    released = _parse_date(fields.get("released"))
    studio = _clean_text(fields.get("studio"))
    parent_external_id = _clean_text(fields.get("parent_external_id"))
    index = _clean_text(fields.get("index"))

    if title:
        data["title"] = title
    if original_title:
        data["original_title"] = original_title
    if description:
        data["description"] = description
    if synopsis:
        data["synopsis"] = synopsis
    if released:
        data["released"] = released
    if studio:
        data["studio"] = studio
    if parent_external_id:
        data["parent_external_id"] = parent_external_id
    if index:
        data["index"] = index

    for source_key, target_key in (
        ("tags", "tags"),
        ("genres", "genres"),
        ("cast", "cast"),
        ("production_countries", "production_countries"),
    ):
        parsed = _split_multi(fields.get(source_key), uppercase=False)
        if parsed:
            data[target_key] = parsed

    license_start = _parse_datetime_to_utc_string(fields.get("license_start"), "start")
    license_end = _parse_datetime_to_utc_string(fields.get("license_end"), "end")
    license_countries = _split_multi(fields.get("license_countries"), uppercase=True)
    if license_start or license_end or license_countries:
        license_entry: Dict[str, Any] = {}
        if license_start:
            license_entry["start"] = license_start
        if license_end:
            license_entry["end"] = license_end
        if license_countries:
            license_entry["countries"] = license_countries
        data["licenses"] = [license_entry]

    video_source = _clean_text(fields.get("video_source"))
    video_profile = _clean_text(fields.get("video_profile"))
    if video_source or video_profile:
        main_video: Dict[str, Any] = {}
        if video_source:
            main_video["source"] = video_source
        if video_profile:
            main_video["profile"] = video_profile
        data["main_video"] = main_video

    cover_image = _clean_text(fields.get("cover_image"))
    teaser_image = _clean_text(fields.get("teaser_image"))
    images: List[Dict[str, str]] = []
    if cover_image:
        images.append({"path": cover_image, "type": "COVER"})
    if teaser_image:
        images.append({"path": teaser_image, "type": "TEASER"})
    if images:
        data["images"] = images

    trailer_source = _clean_text(fields.get("trailer_source"))
    trailer_profile = _clean_text(fields.get("trailer_profile"))
    if trailer_source or trailer_profile:
        trailer: Dict[str, str] = {}
        if trailer_source:
            trailer["source"] = trailer_source
        if trailer_profile:
            trailer["profile"] = trailer_profile
        data["trailers"] = [trailer]

    language_tag = _clean_text(fields.get("language_tag"))
    localized_title = _clean_text(fields.get("localized_title"))
    localized_description = _clean_text(fields.get("localized_description"))
    localized_synopsis = _clean_text(fields.get("localized_synopsis"))
    if localized_title or localized_description or localized_synopsis:
        localization: Dict[str, str] = {}
        if language_tag:
            localization["language_tag"] = language_tag
        if localized_title:
            localization["title"] = localized_title
        if localized_description:
            localization["description"] = localized_description
        if localized_synopsis:
            localization["synopsis"] = localized_synopsis
        data["localizations"] = [localization]

    return data
