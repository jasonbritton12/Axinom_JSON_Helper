#!/usr/bin/env python3
"""Local web app for creating Axinom ingest JSON from forms or Excel templates."""

from __future__ import annotations

import json
import os
import sys
import threading
import traceback
from email.parser import BytesParser
from email.policy import default as email_policy
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict
from urllib.parse import parse_qs, urlparse

from ingest_converter import IngestConverter
from xlsx_reader import parse_xlsx_rows


BASE_DIR = Path(__file__).resolve().parent
WORKSPACE_DIR = BASE_DIR.parent
MEIPASS_DIR = Path(getattr(sys, "_MEIPASS", BASE_DIR))


def _resolve_existing_path(*candidates: Path) -> Path:
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


STATIC_DIR = _resolve_existing_path(
    BASE_DIR / "static",
    MEIPASS_DIR / "webapp" / "static",
    MEIPASS_DIR / "static",
)
CONFIG_PATH = _resolve_existing_path(
    BASE_DIR / "program_types.json",
    MEIPASS_DIR / "webapp" / "program_types.json",
    MEIPASS_DIR / "program_types.json",
)


def _resolve_template(filename: str) -> Path:
    return _resolve_existing_path(
        WORKSPACE_DIR / filename,
        WORKSPACE_DIR / "docs" / "reference" / filename,
        BASE_DIR.parent / filename,
        BASE_DIR.parent / "docs" / "reference" / filename,
        BASE_DIR / filename,
        MEIPASS_DIR / "templates" / filename,
        MEIPASS_DIR / filename,
    )

TEMPLATE_FILES = {
    "v1_0_0": _resolve_template("axinom_ingest_template_v1_0_0.xlsx"),
    "v1_1_0": _resolve_template("axinom_ingest_template_v1_1_0.xlsx"),
    "v1_2_0": _resolve_template("axinom_ingest_template_v1_2_0.xlsx"),
    "v1_3_0": _resolve_template("axinom_ingest_template_v1_3_0.xlsx"),
    "latest": _resolve_template("axinom_ingest_template_v1_3_0.xlsx"),
}

APP_RELEASE_LABEL = "v1.3.0 (2026-03-10)"


class AppRequestHandler(SimpleHTTPRequestHandler):
    converter = IngestConverter(CONFIG_PATH)
    on_app_quit = None
    on_activity = None

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format: str, *args: Any) -> None:
        # Keep default-style logs, but shorter for local use.
        message = "%s - - [%s] %s\n" % (
            self.address_string(),
            self.log_date_time_string(),
            format % args,
        )
        print(message, end="")

    def _notify_activity(self, path: str) -> None:
        callback = getattr(self.__class__, "on_activity", None)
        if not callback:
            return
        try:
            callback(path)
        except Exception:
            return

    def do_GET(self) -> None:
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        self._notify_activity(path)

        if path == "/api/template-download":
            self._handle_template_download(parsed_url.query)
            return

        if path == "/api/picklists":
            self._send_json(
                HTTPStatus.OK,
                {
                    "ok": True,
                    "video_profiles": [
                        "nDRM (HLS-Only) HD",
                        "DRM (HLS+Dash) HD",
                        "nDRM (HLS-Only) SD",
                        "DRM (HLS+Dash) SD",
                    ],
                    "image_types": ["COVER", "TEASER"],
                    "common_country_codes": ["US", "CA", "GB", "DE", "FR", "AU", "ES", "IT", "SE", "NL"],
                    "common_language_tags": [
                        "en-US",
                        "en-GB",
                        "es-ES",
                        "fr-FR",
                        "de-DE",
                        "it-IT",
                        "pt-BR",
                        "sv-SE",
                    ],
                },
            )
            return

        if path == "/api/config":
            payload = {
                "ok": True,
                "program_types": self.converter.supported_program_types(),
                "required_fields": self.converter.required_fields_by_program_type(),
                "app_release_label": APP_RELEASE_LABEL,
            }
            self._send_json(HTTPStatus.OK, payload)
            return

        if path == "/api/health":
            self._send_json(HTTPStatus.OK, {"ok": True})
            return

        if path == "/api/runtime":
            has_quit = bool(getattr(self.__class__, "on_app_quit", None))
            self._send_json(
                HTTPStatus.OK,
                {
                    "ok": True,
                    "mode": "desktop" if has_quit else "web",
                    "quit_supported": has_quit,
                },
            )
            return

        # Serve static app assets.
        if path in ("/", ""):
            self.path = "/index.html"

        super().do_GET()

    def do_POST(self) -> None:
        self._notify_activity(self.path)
        if self.path == "/api/single":
            self._handle_single()
            return

        if self.path == "/api/quit":
            self._handle_quit()
            return

        if self.path == "/api/convert-rows":
            self._handle_convert_rows()
            return

        if self.path == "/api/convert-excel":
            self._handle_convert_excel()
            return

        self._send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Endpoint not found"})

    def _handle_single(self) -> None:
        try:
            payload = self._read_json_body()
        except ValueError as exc:
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(exc)})
            return

        result = self.converter.form_payload_to_document(payload)
        status = HTTPStatus.OK if result.get("ok") else HTTPStatus.BAD_REQUEST
        self._send_json(status, result)

    def _handle_quit(self) -> None:
        callback = getattr(self.__class__, "on_app_quit", None)
        if not callback:
            self._send_json(
                HTTPStatus.CONFLICT,
                {
                    "ok": False,
                    "error": "Quit endpoint is unavailable in this run mode.",
                },
            )
            return

        self._send_json(HTTPStatus.OK, {"ok": True})
        threading.Thread(target=callback, daemon=True).start()

    def _handle_convert_rows(self) -> None:
        try:
            payload = self._read_json_body()
        except ValueError as exc:
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(exc)})
            return

        rows = payload.get("rows")
        if not isinstance(rows, list):
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Payload field 'rows' must be an array"})
            return

        document_name = str(payload.get("name") or "Axinom Direct Sheet Ingest").strip()
        source_name = str(payload.get("source") or "direct_rows").strip()
        sheet_name = str(payload.get("sheet_name") or "Direct Entry").strip()
        document_description = str(payload.get("description") or "").strip()
        document_created = str(payload.get("document_created") or "").strip()

        result = self.converter.rows_to_document(
            rows,
            document_name=document_name,
            source_name=source_name,
            sheet_name=sheet_name,
            document_description=document_description,
            document_created=document_created,
        )
        status = HTTPStatus.OK if result.get("ok") else HTTPStatus.BAD_REQUEST
        self._send_json(status, result)

    def _handle_convert_excel(self) -> None:
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            self._send_json(
                HTTPStatus.BAD_REQUEST,
                {
                    "ok": False,
                    "error": "Expected multipart/form-data with fields: file, name (optional), sheet_name (optional)",
                },
            )
            return

        try:
            body = self._read_raw_body()
            fields, files = self._parse_multipart(content_type, body)
        except Exception as exc:  # noqa: BLE001
            self._send_json(
                HTTPStatus.BAD_REQUEST,
                {"ok": False, "error": f"Failed to parse multipart data: {exc}"},
            )
            return

        if "file" not in files:
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Missing file upload field 'file'"})
            return

        upload = files["file"]
        if not upload.get("content"):
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Uploaded file is empty"})
            return

        file_bytes = upload["content"]
        file_name = upload.get("filename") or "upload.xlsx"
        document_name = fields.get("name", "").strip() or "Axinom Bulk Ingest"
        sheet_name = fields.get("sheet_name", "").strip() or None
        document_description = fields.get("description", "").strip()
        document_created = fields.get("document_created", "").strip()

        try:
            parsed = parse_xlsx_rows(file_bytes, sheet_name=sheet_name)
            result = self.converter.rows_to_document(
                parsed.rows,
                document_name=document_name,
                source_name=file_name,
                sheet_name=parsed.sheet_name,
                document_description=document_description,
                document_created=document_created,
                row_numbers=parsed.row_numbers,
                row_cells=parsed.row_cells,
            )

            status = HTTPStatus.OK if result.get("ok") else HTTPStatus.BAD_REQUEST
            self._send_json(status, result)
        except Exception as exc:  # noqa: BLE001
            self._send_json(
                HTTPStatus.BAD_REQUEST,
                {
                    "ok": False,
                    "error": f"Failed to convert workbook: {exc}",
                    "debug": traceback.format_exc(),
                },
            )

    def _handle_template_download(self, query_string: str) -> None:
        query = parse_qs(query_string or "")
        version = (query.get("version", ["latest"])[0] or "latest").strip().lower()
        template_path = TEMPLATE_FILES.get(version, TEMPLATE_FILES["latest"])

        if not template_path.exists():
            self._send_json(
                HTTPStatus.NOT_FOUND,
                {
                    "ok": False,
                    "error": f"Template version '{version}' is not available on disk.",
                },
            )
            return

        file_bytes = template_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        self.send_header("Content-Length", str(len(file_bytes)))
        self.send_header(
            "Content-Disposition",
            f'attachment; filename=\"{template_path.name}\"',
        )
        self.end_headers()
        self.wfile.write(file_bytes)

    def _read_json_body(self) -> Dict[str, Any]:
        raw_length = self.headers.get("Content-Length", "0")
        try:
            length = int(raw_length)
        except ValueError as exc:
            raise ValueError("Invalid Content-Length header") from exc

        body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            return json.loads(body.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON payload: {exc}") from exc

    def _read_raw_body(self) -> bytes:
        raw_length = self.headers.get("Content-Length", "0")
        try:
            length = int(raw_length)
        except ValueError as exc:
            raise ValueError("Invalid Content-Length header") from exc
        return self.rfile.read(length) if length > 0 else b""

    def _parse_multipart(self, content_type: str, body: bytes) -> tuple[Dict[str, str], Dict[str, Dict[str, bytes]]]:
        mime_bytes = (
            f"Content-Type: {content_type}\r\n"
            "MIME-Version: 1.0\r\n"
            "\r\n"
        ).encode("utf-8") + body
        message = BytesParser(policy=email_policy).parsebytes(mime_bytes)

        fields: Dict[str, str] = {}
        files: Dict[str, Dict[str, bytes]] = {}

        for part in message.iter_parts():
            disposition = part.get("Content-Disposition", "")
            if "form-data" not in disposition:
                continue

            name = part.get_param("name", header="content-disposition")
            if not name:
                continue

            filename = part.get_param("filename", header="content-disposition")
            payload = part.get_payload(decode=True) or b""

            if filename:
                files[name] = {
                    "filename": filename.encode("utf-8", "ignore").decode("utf-8"),
                    "content": payload,
                }
            else:
                fields[name] = payload.decode(part.get_content_charset() or "utf-8", errors="replace")

        return fields, files

    def _send_json(self, status: HTTPStatus, payload: Dict[str, Any]) -> None:
        data = json.dumps(payload, indent=2, ensure_ascii=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def run(host: str = "127.0.0.1", port: int = 8080) -> None:
    server = ThreadingHTTPServer((host, port), AppRequestHandler)
    print(f"Axinom ingest helper running on http://{host}:{port}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    host = os.environ.get("AXINOM_HELPER_HOST", "127.0.0.1")
    port_raw = os.environ.get("AXINOM_HELPER_PORT", "8080")
    try:
        port = int(port_raw)
    except ValueError:
        port = 8080
    run(host=host, port=port)
