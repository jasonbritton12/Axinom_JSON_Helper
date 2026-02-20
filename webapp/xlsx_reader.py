"""Minimal XLSX reader using stdlib only.

This reader supports the flat template style used for Axinom ingest spreadsheets:
- reads workbook sheets
- resolves shared strings
- parses first row as headers
- returns each next row as a dict(header -> value)
"""

from __future__ import annotations

import re
import zipfile
from dataclasses import dataclass
from io import BytesIO
from typing import Dict, List, Optional, Tuple
from xml.etree import ElementTree as ET

MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
OFFICE_REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

NS = {"m": MAIN_NS}

CELL_REF_RE = re.compile(r"^([A-Z]+)([0-9]+)$")


@dataclass
class ParsedSheet:
    sheet_name: str
    headers: List[str]
    rows: List[Dict[str, str]]


def _col_to_index(col_letters: str) -> int:
    value = 0
    for char in col_letters:
        value = (value * 26) + (ord(char) - ord("A") + 1)
    return value - 1


def _read_shared_strings(zf: zipfile.ZipFile) -> List[str]:
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []

    shared_root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    shared_values: List[str] = []
    for si in shared_root.findall("m:si", NS):
        parts = [node.text or "" for node in si.findall(".//m:t", NS)]
        shared_values.append("".join(parts))
    return shared_values


def _read_workbook_sheet_targets(zf: zipfile.ZipFile) -> List[Tuple[str, str]]:
    wb_root = ET.fromstring(zf.read("xl/workbook.xml"))
    rel_root = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))

    rel_map = {
        rel.attrib["Id"]: rel.attrib["Target"]
        for rel in rel_root.findall(f"{{{REL_NS}}}Relationship")
    }

    sheets: List[Tuple[str, str]] = []
    for sheet in wb_root.findall(".//m:sheet", NS):
        name = sheet.attrib.get("name", "Sheet")
        rid = sheet.attrib.get(f"{{{OFFICE_REL_NS}}}id")
        if not rid or rid not in rel_map:
            continue
        target = rel_map[rid]
        if not target.startswith("/"):
            target = "xl/" + target
        else:
            target = target.lstrip("/")
        sheets.append((name, target))

    return sheets


def _cell_value(cell: ET.Element, shared_strings: List[str]) -> str:
    ctype = cell.attrib.get("t")

    if ctype == "inlineStr":
        parts = [node.text or "" for node in cell.findall(".//m:t", NS)]
        return "".join(parts).strip()

    v = cell.find("m:v", NS)
    if v is None or v.text is None:
        return ""

    text = v.text.strip()
    if ctype == "s":
        if text.isdigit():
            idx = int(text)
            if 0 <= idx < len(shared_strings):
                return shared_strings[idx].strip()
        return ""

    if ctype == "b":
        return "TRUE" if text == "1" else "FALSE"

    # Keep numerics as strings so consumers can choose their own parsing strategy.
    return text


def _parse_sheet_rows(
    zf: zipfile.ZipFile,
    sheet_target: str,
    shared_strings: List[str],
) -> List[Dict[int, str]]:
    root = ET.fromstring(zf.read(sheet_target))
    result: List[Dict[int, str]] = []

    for row in root.findall(".//m:sheetData/m:row", NS):
        values_by_col: Dict[int, str] = {}
        for cell in row.findall("m:c", NS):
            cell_ref = cell.attrib.get("r", "")
            match = CELL_REF_RE.match(cell_ref)
            if not match:
                continue

            col_letters = match.group(1)
            col_index = _col_to_index(col_letters)
            value = _cell_value(cell, shared_strings)
            values_by_col[col_index] = value

        if values_by_col:
            result.append(values_by_col)

    return result


def _extract_header_and_records(raw_rows: List[Dict[int, str]]) -> Tuple[List[str], List[Dict[str, str]]]:
    if not raw_rows:
        return [], []

    header_cells = raw_rows[0]
    max_col = max(header_cells.keys())
    headers: List[str] = []
    for idx in range(max_col + 1):
        header_text = header_cells.get(idx, "").strip()
        headers.append(header_text)

    records: List[Dict[str, str]] = []
    for raw_row in raw_rows[1:]:
        row: Dict[str, str] = {}
        for idx, header in enumerate(headers):
            if not header:
                continue
            value = raw_row.get(idx, "").strip()
            row[header] = value

        if any(value for value in row.values()):
            records.append(row)

    return headers, records


def parse_xlsx_rows(file_bytes: bytes, sheet_name: Optional[str] = None) -> ParsedSheet:
    with zipfile.ZipFile(BytesIO(file_bytes)) as zf:
        shared_strings = _read_shared_strings(zf)
        sheets = _read_workbook_sheet_targets(zf)

        if not sheets:
            raise ValueError("No sheets found in workbook.")

        selected_name = None
        selected_target = None

        if sheet_name:
            for candidate_name, candidate_target in sheets:
                if candidate_name.lower() == sheet_name.lower():
                    selected_name = candidate_name
                    selected_target = candidate_target
                    break

        if not selected_target:
            selected_name, selected_target = sheets[0]

        raw_rows = _parse_sheet_rows(zf, selected_target, shared_strings)
        headers, records = _extract_header_and_records(raw_rows)

        return ParsedSheet(sheet_name=selected_name, headers=headers, rows=records)
