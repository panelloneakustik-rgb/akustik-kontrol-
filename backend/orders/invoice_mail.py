"""Parse TÜRMOB / e-Arşiv PDF/mail text and match AK-#### order codes."""
from __future__ import annotations

import email
import io
import re
from email.header import decode_header, make_header
from email.message import Message

import pdfplumber

ORDER_CODE_RE = re.compile(r"\bAK\s*[-–]?\s*(\d+)\b", re.IGNORECASE)
INVOICE_NO_RE = re.compile(
    r"(?:fatura\s*(?:no|numaras[ıi])|ettn)\s*[:.\-]?\s*([A-Z0-9\-/]{5,40})",
    re.IGNORECASE,
)


def decode_header_value(value: str | None) -> str:
    if not value:
        return ""
    try:
        return str(make_header(decode_header(value)))
    except Exception:
        return value


def normalize_order_code(number: str | int) -> str:
    return f"AK-{int(str(number).strip())}"


def extract_order_codes(*texts: str) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    for text in texts:
        if not text:
            continue
        for match in ORDER_CODE_RE.finditer(text):
            code = normalize_order_code(match.group(1))
            if code not in seen:
                seen.add(code)
                found.append(code)
    return found


def extract_pdf_text(pdf_bytes: bytes) -> str:
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        return "\n".join((page.extract_text() or "") for page in pdf.pages)


def extract_invoice_number(text: str) -> str:
    match = INVOICE_NO_RE.search(text or "")
    return match.group(1).strip() if match else ""


def iter_pdf_attachments(msg: Message):
    for part in msg.walk():
        if part.get_content_maintype() == "multipart":
            continue
        filename = decode_header_value(part.get_filename() or "")
        content_type = (part.get_content_type() or "").lower()
        if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
            payload = part.get_payload(decode=True)
            if payload:
                yield filename or "fatura.pdf", payload


def get_body_text(msg: Message) -> str:
    chunks: list[str] = []
    parts = msg.walk() if msg.is_multipart() else [msg]
    for part in parts:
        if part.get_content_type() not in ("text/plain", "text/html"):
            continue
        payload = part.get_payload(decode=True) or b""
        charset = part.get_content_charset() or "utf-8"
        try:
            chunks.append(payload.decode(charset, errors="replace"))
        except LookupError:
            chunks.append(payload.decode("utf-8", errors="replace"))
    return "\n".join(chunks)


def parse_rfc822(raw: bytes) -> Message:
    return email.message_from_bytes(raw)


def pick_pdf_for_codes(attachments: list[tuple[str, bytes]], codes: list[str]) -> tuple[str, bytes]:
    """Prefer the PDF that actually contains the matched order code."""
    if len(attachments) == 1:
        return attachments[0]
    for name, data in attachments:
        try:
            text = extract_pdf_text(data)
        except Exception:
            continue
        pdf_codes = set(extract_order_codes(text))
        if pdf_codes.intersection(codes):
            return name, data
    return attachments[0]
