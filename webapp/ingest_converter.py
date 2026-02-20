"""Core conversion logic for Axinom ingest JSON generation."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


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

    def supported_program_types(self) -> List[str]:
        return sorted(self.config["program_types"].keys())

    def required_fields_by_program_type(self) -> Dict[str, List[str]]:
        return {
            key: value.get("required", [])
            for key, value in self.config["program_types"].items()
        }

    def normalize_program_type(self, value: Any) -> str:
        raw = _clean_text(value).upper()
        if raw in self.config["program_types"]:
            return raw

        aliases = self.config.get("type_aliases", {})
        return aliases.get(raw, raw)

    def form_payload_to_document(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        document_name = _clean_text(payload.get("name")) or "Axinom Ingest"
        document_description = _clean_text(payload.get("description"))
        document_created = _clean_text(payload.get("document_created"))
        fields = payload.get("fields") or {}

        build_result = self._build_item(fields)
        if build_result.errors:
            return {
                "ok": False,
                "errors": build_result.errors,
                "warnings": build_result.warnings,
            }

        document: Dict[str, Any] = {
            "name": document_name,
            "items": [build_result.item],
        }

        if document_description:
            document["description"] = document_description

        normalized_created = _normalize_document_created(document_created)
        if normalized_created:
            document["document_created"] = normalized_created

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
    ) -> Dict[str, Any]:
        items: List[Dict[str, Any]] = []
        warnings: List[str] = []
        row_errors: List[Dict[str, Any]] = []

        for idx, row in enumerate(rows, start=2):
            fields = self._map_row_to_fields(row)

            # Skip purely empty rows.
            if not any(_clean_text(v) for v in fields.values()):
                continue

            build_result = self._build_item(fields)
            if build_result.errors:
                row_errors.append(
                    {
                        "row": idx,
                        "errors": build_result.errors,
                        "raw_row": row,
                    }
                )
                continue

            items.append(build_result.item)
            for warning in build_result.warnings:
                warnings.append(f"Row {idx}: {warning}")

        overall_ok = len(items) > 0

        if not overall_ok and not row_errors:
            row_errors.append(
                {
                    "row": 0,
                    "errors": ["No ingest rows found in spreadsheet."],
                    "raw_row": {},
                }
            )

        document = {"name": document_name, "items": items} if items else None
        if document:
            description = _clean_text(document_description)
            created = _normalize_document_created(document_created)
            if description:
                document["description"] = description
            if created:
                document["document_created"] = created

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
        data = _build_data(fields)

        localized_present = any(
            _clean_text(fields.get(key))
            for key in ("localized_title", "localized_description", "localized_synopsis")
        )
        if localized_present and not _clean_text(fields.get("language_tag")):
            errors.append("Field 'language_tag' is required when localized fields are provided")

        if ingest_type in {"TVSHOW", "SEASON"}:
            data.pop("main_video", None)

        main_video = data.get("main_video") or {}
        if "profile" in main_video and "source" not in main_video:
            errors.append("Field 'main_video.source' is required when 'main_video.profile' is set")

        for trailer in data.get("trailers") or []:
            if "profile" in trailer and "source" not in trailer:
                errors.append("Field 'trailers[].source' is required when 'trailers[].profile' is set")

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
