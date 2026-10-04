"""Match TÜRMOB PDFs to orders by AK-#### in the filename or PDF text."""
from __future__ import annotations

from dataclasses import dataclass

from django.core.files.base import ContentFile
from django.utils import timezone

from orders.invoice_mail import extract_invoice_number, extract_order_codes, extract_pdf_text
from orders.models import Order


def find_order(codes: list[str]) -> Order | None:
    for code in codes:
        order = Order.objects.filter(order_code__iexact=code).first()
        if order:
            return order
        try:
            pk = int(code.split("-", 1)[1])
        except (IndexError, ValueError):
            continue
        order = Order.objects.filter(pk=pk).first()
        if order:
            return order
    return None


def attach_invoice_pdf(
    order: Order,
    filename: str,
    pdf_bytes: bytes,
    invoice_no: str = "",
    uid_str: str = "",
) -> None:
    safe_name = filename.replace("\\", "_").replace("/", "_") or "fatura.pdf"
    order.invoice_pdf.save(safe_name, ContentFile(pdf_bytes), save=False)
    if invoice_no:
        order.invoice_number = invoice_no
    order.invoice_matched_at = timezone.now()
    if uid_str:
        order.invoice_email_uid = uid_str
        order.save(
            update_fields=[
                "invoice_pdf",
                "invoice_number",
                "invoice_matched_at",
                "invoice_email_uid",
            ]
        )
        return
    order.save(update_fields=["invoice_pdf", "invoice_number", "invoice_matched_at"])


def read_pdf_text(pdf_bytes: bytes) -> str:
    try:
        return extract_pdf_text(pdf_bytes)
    except Exception:
        return ""


@dataclass
class AutoAttachResult:
    filename: str
    ok: bool
    skipped: bool
    order_code: str
    detail: str


def auto_attach_pdf(filename: str, pdf_bytes: bytes, overwrite: bool = False) -> AutoAttachResult:
    name = filename or "fatura.pdf"
    if not name.lower().endswith(".pdf"):
        return AutoAttachResult(name, False, False, "", "Sadece PDF kabul edilir.")

    text = read_pdf_text(pdf_bytes)
    codes = extract_order_codes(name, text)
    order = find_order(codes)
    if not order:
        hint = ", ".join(codes) if codes else "dosya adında veya PDF içinde AK-… yok"
        return AutoAttachResult(
            name,
            False,
            False,
            "",
            f"Sipariş bulunamadı ({hint}). Dosyayı AK-12.pdf diye kaydet veya TÜRMOB açıklamasına kodu yaz.",
        )

    invoice_no = extract_invoice_number(text)
    if order.invoice_pdf and not overwrite:
        return AutoAttachResult(
            name,
            False,
            True,
            order.order_code or str(order.pk),
            "Bu siparişte fatura var; üzerine yazmak için kutuyu işaretle.",
        )

    attach_invoice_pdf(order, name, pdf_bytes, invoice_no)
    return AutoAttachResult(
        name,
        True,
        False,
        order.order_code or str(order.pk),
        "Bağlandı, müşteri Siparişlerim’den görür.",
    )
