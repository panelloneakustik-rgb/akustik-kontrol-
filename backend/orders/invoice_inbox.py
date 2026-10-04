"""Process one TÜRMOB invoice e-mail (RFC822) and attach PDFs to orders."""
from __future__ import annotations

from dataclasses import dataclass

from django.conf import settings

from orders.invoice_mail import (
    decode_header_value,
    extract_invoice_number,
    extract_order_codes,
    extract_pdf_text,
    get_body_text,
    iter_pdf_attachments,
    parse_rfc822,
    pick_pdf_for_codes,
)
from orders.invoice_match import attach_invoice_pdf, find_order


@dataclass
class MailProcessResult:
    status: str  # matched | skipped | unmatched | no_pdf
    detail: str
    order_code: str = ""


def imap_public_status() -> dict:
    host = (getattr(settings, "IMAP_HOST", "") or "").strip()
    user = (getattr(settings, "IMAP_USER", "") or "").strip()
    password = (getattr(settings, "IMAP_PASSWORD", "") or "").replace(" ", "")
    port = int(getattr(settings, "IMAP_PORT", 993) or 993)
    folder = (getattr(settings, "IMAP_FOLDER", "INBOX") or "INBOX").strip()
    return {
        "configured": bool(host and user and password),
        "host": host,
        "port": port,
        "user": user or "panellone.akustik@gmail.com",
        "folder": folder,
        "processed": getattr(settings, "IMAP_PROCESSED_FOLDER", "Processed"),
        "unmatched": getattr(settings, "IMAP_UNMATCHED_FOLDER", "Unmatched"),
    }


def process_rfc822(
    raw: bytes,
    overwrite: bool = False,
    uid_str: str = "local",
    dry_run: bool = False,
) -> MailProcessResult:
    msg = parse_rfc822(raw)
    subject = decode_header_value(msg.get("Subject"))
    body = get_body_text(msg)
    attachments = list(iter_pdf_attachments(msg))
    if not attachments:
        return MailProcessResult("no_pdf", f"PDF ek yok ({subject or 'konu yok'})")

    names = [name for name, _ in attachments]
    pdf_texts: list[str] = []
    for _name, pdf_bytes in attachments:
        try:
            pdf_texts.append(extract_pdf_text(pdf_bytes))
        except Exception:
            pdf_texts.append("")

    codes = extract_order_codes(subject, body, *names, *pdf_texts)
    order = find_order(codes)
    if not order:
        hint = ", ".join(codes) if codes else "konu/ek/PDF içinde AK-… yok"
        return MailProcessResult(
            "unmatched",
            f"Sipariş yok ({subject or 'konu yok'}). Adaylar: {hint}",
        )

    code = order.order_code or str(order.pk)
    if order.invoice_pdf and not overwrite:
        return MailProcessResult(
            "skipped",
            f"{code} zaten faturalı",
            order_code=code,
        )

    filename, pdf_bytes = pick_pdf_for_codes(attachments, codes)
    combined = "\n".join(pdf_texts)
    invoice_no = extract_invoice_number(combined) or extract_invoice_number(f"{subject}\n{body}")
    if dry_run:
        return MailProcessResult("matched", f"[dry-run] {code} ({filename})", order_code=code)
    attach_invoice_pdf(order, filename, pdf_bytes, invoice_no, uid_str=uid_str)
    return MailProcessResult("matched", f"{code} bağlandı ({filename})", order_code=code)
