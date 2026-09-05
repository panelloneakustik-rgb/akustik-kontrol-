"""IMAP: Luca e-Arşiv PDF eklerini sipariş koduna (AK-123) bağlar.

Operasyon:
  1. Luca açıklamasına sipariş kodunu yaz (AK-1042)
  2. PDF'i fatura kutusuna ek alıcı / forward et
  3. Bu komut 5 dakikada bir çalışır

  python manage.py check_invoice_emails --test-connection
  python manage.py check_invoice_emails --dry-run
  python manage.py check_invoice_emails
  python manage.py check_invoice_emails --file fatura.pdf --order AK-12
"""
from __future__ import annotations

import imaplib
import logging
import ssl
from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from orders.invoice_mail import (
    extract_invoice_number,
    extract_order_codes,
    extract_pdf_text,
    get_body_text,
    iter_pdf_attachments,
    parse_rfc822,
    pick_pdf_for_codes,
    decode_header_value,
)
from orders.models import Order

logger = logging.getLogger("orders.invoices")


def _setup_file_logging():
    log_dir = Path(settings.BASE_DIR) / "logs"
    log_dir.mkdir(exist_ok=True)
    handler = logging.FileHandler(log_dir / "invoice_imap.log", encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    if not any(isinstance(h, logging.FileHandler) for h in logger.handlers):
        logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def _imap_settings():
    host = (getattr(settings, "IMAP_HOST", "") or "").strip()
    user = (getattr(settings, "IMAP_USER", "") or "").strip()
    password = (getattr(settings, "IMAP_PASSWORD", "") or "").replace(" ", "")
    port = int(getattr(settings, "IMAP_PORT", 993) or 993)
    folder = (getattr(settings, "IMAP_FOLDER", "INBOX") or "INBOX").strip()
    processed = (getattr(settings, "IMAP_PROCESSED_FOLDER", "Processed") or "Processed").strip()
    unmatched = (getattr(settings, "IMAP_UNMATCHED_FOLDER", "Unmatched") or "Unmatched").strip()
    return host, user, password, port, folder, processed, unmatched


def _connect():
    host, user, password, port, *_ = _imap_settings()
    if not host or not user or not password:
        raise CommandError(
            "IMAP ayarı eksik. backend/.env içine IMAP_USER ve IMAP_PASSWORD yazın."
        )
    ctx = ssl.create_default_context()
    try:
        imap = imaplib.IMAP4_SSL(host, port, ssl_context=ctx)
        imap.login(user, password)
    except imaplib.IMAP4.error as exc:
        raise CommandError(f"IMAP girişi başarısız: {exc}") from exc
    return imap


def _ensure_folder(imap: imaplib.IMAP4_SSL, name: str):
    typ, _ = imap.create(name)
    if typ not in ("OK", "NO"):
        raise CommandError(f"Klasör oluşturulamadı: {name}")


def _move_uid(imap: imaplib.IMAP4_SSL, uid: bytes, dest: str):
    imap.uid("COPY", uid, dest)
    imap.uid("STORE", uid, "+FLAGS", r"(\Seen \Deleted)")


def _find_order(codes: list[str]) -> Order | None:
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


def _attach_pdf(order: Order, filename: str, pdf_bytes: bytes, invoice_no: str, uid_str: str):
    safe_name = filename.replace("\\", "_").replace("/", "_") or "fatura.pdf"
    order.invoice_pdf.save(safe_name, ContentFile(pdf_bytes), save=False)
    order.invoice_number = invoice_no
    order.invoice_matched_at = timezone.now()
    order.invoice_email_uid = uid_str
    order.save(
        update_fields=[
            "invoice_pdf",
            "invoice_number",
            "invoice_matched_at",
            "invoice_email_uid",
        ]
    )


class Command(BaseCommand):
    help = "Fatura kutusundaki PDF'leri siparişlere bağlar (Luca e-Arşiv)."

    def add_arguments(self, parser):
        parser.add_argument("--test-connection", action="store_true", help="Sadece IMAP girişi ve klasör kontrolü.")
        parser.add_argument("--dry-run", action="store_true", help="Kaydetme, maili taşıma.")
        parser.add_argument("--overwrite", action="store_true", help="Var olan faturanın üzerine yaz.")
        parser.add_argument("--limit", type=int, default=50)
        parser.add_argument("--file", dest="pdf_file", help="IMAP'siz yerel PDF testi.")
        parser.add_argument("--order", dest="order_code", help="--file ile birlikte sipariş kodu (AK-12).")

    def handle(self, *args, **options):
        _setup_file_logging()

        if options["pdf_file"]:
            return self._handle_file(options)
        if options["test_connection"]:
            return self._handle_test()
        return self._handle_inbox(options)

    def _handle_test(self):
        host, user, _, port, folder, processed, unmatched = _imap_settings()
        imap = _connect()
        try:
            _ensure_folder(imap, processed)
            _ensure_folder(imap, unmatched)
            typ, _ = imap.select(folder, readonly=True)
            if typ != "OK":
                raise CommandError(f"Klasör açılamadı: {folder}")
            typ, data = imap.uid("search", None, "UNSEEN")
            count = len((data[0] or b"").split()) if typ == "OK" else 0
            msg = (
                f"IMAP bağlantısı başarılı. host={host}:{port} user={user} "
                f"klasör={folder} okunmamış={count} işlenen={processed} eşleşmeyen={unmatched}"
            )
            logger.info(msg)
            self.stdout.write(self.style.SUCCESS(msg))
        finally:
            imap.logout()

    def _handle_file(self, options):
        path = Path(options["pdf_file"])
        if not path.exists():
            raise CommandError(f"Dosya yok: {path}")
        pdf_bytes = path.read_bytes()
        try:
            text = extract_pdf_text(pdf_bytes)
        except Exception as exc:
            raise CommandError(f"PDF okunamadı: {exc}") from exc

        codes = extract_order_codes(text)
        if options["order_code"]:
            codes = [options["order_code"].upper().replace(" ", "")] + codes

        order = _find_order(codes)
        if not order:
            raise CommandError(f"Sipariş bulunamadı. PDF'deki kodlar: {codes or '-'}")

        invoice_no = extract_invoice_number(text)
        if options["dry_run"]:
            self.stdout.write(f"[dry-run] {path.name} -> {order.order_code} no={invoice_no or '-'}")
            return

        if order.invoice_pdf and not options["overwrite"]:
            raise CommandError(f"{order.order_code} zaten faturalı. --overwrite kullanın.")

        _attach_pdf(order, path.name, pdf_bytes, invoice_no, uid_str="local-file")
        msg = f"Yerel PDF bağlandı: {order.order_code}"
        logger.info(msg)
        self.stdout.write(self.style.SUCCESS(msg))

    def _handle_inbox(self, options):
        _, _, _, _, folder, processed, unmatched = _imap_settings()
        dry_run = options["dry_run"]
        overwrite = options["overwrite"]
        limit = options["limit"]

        imap = _connect()
        matched = skipped = unmatched_n = 0
        try:
            if not dry_run:
                _ensure_folder(imap, processed)
                _ensure_folder(imap, unmatched)

            typ, _ = imap.select(folder, readonly=dry_run)
            if typ != "OK":
                raise CommandError(f"Klasör açılamadı: {folder}")

            typ, data = imap.uid("search", None, "UNSEEN")
            if typ != "OK":
                raise CommandError("UNSEEN araması başarısız.")

            uids = (data[0] or b"").split()[:limit]
            logger.info("Okunmamış mail: %s", len(uids))
            self.stdout.write(f"{len(uids)} okunmamış mail bulundu.")

            for uid in uids:
                uid_str = uid.decode() if isinstance(uid, bytes) else str(uid)
                typ, fetched = imap.uid("fetch", uid, "(RFC822)")
                if typ != "OK" or not fetched or fetched[0] is None:
                    skipped += 1
                    continue

                raw = fetched[0][1]
                msg = parse_rfc822(raw)
                subject = decode_header_value(msg.get("Subject"))
                body = get_body_text(msg)
                attachments = list(iter_pdf_attachments(msg))

                if not attachments:
                    logger.warning("UID %s: PDF ek yok (%s)", uid_str, subject)
                    self.stdout.write(self.style.WARNING(f"UID {uid_str}: PDF ek yok, Unmatched."))
                    unmatched_n += 1
                    if not dry_run:
                        _move_uid(imap, uid, unmatched)
                    continue

                pdf_texts = []
                for _name, pdf_bytes in attachments:
                    try:
                        pdf_texts.append(extract_pdf_text(pdf_bytes))
                    except Exception as exc:
                        logger.warning("UID %s PDF okunamadı: %s", uid_str, exc)

                codes = extract_order_codes(subject, body, *pdf_texts)
                order = _find_order(codes)

                if not order:
                    logger.warning("UID %s eşleşmedi subject=%s codes=%s", uid_str, subject, codes)
                    self.stdout.write(
                        self.style.WARNING(
                            f"UID {uid_str} ({subject!r}): sipariş yok. Adaylar: {codes or '-'}"
                        )
                    )
                    unmatched_n += 1
                    if not dry_run:
                        _move_uid(imap, uid, unmatched)
                    continue

                if order.invoice_pdf and not overwrite:
                    logger.info("UID %s: %s zaten faturalı", uid_str, order.order_code)
                    skipped += 1
                    if not dry_run:
                        _move_uid(imap, uid, processed)
                    continue

                filename, pdf_bytes = pick_pdf_for_codes(attachments, codes)
                combined_text = "\n".join(pdf_texts)
                invoice_no = extract_invoice_number(combined_text) or extract_invoice_number(
                    f"{subject}\n{body}"
                )

                if dry_run:
                    self.stdout.write(
                        f"[dry-run] UID {uid_str} -> {order.order_code} ({filename}, no={invoice_no or '-'})"
                    )
                    matched += 1
                    continue

                _attach_pdf(order, filename, pdf_bytes, invoice_no, uid_str)
                _move_uid(imap, uid, processed)
                matched += 1
                logger.info("Bağlandı %s uid=%s fatura=%s", order.order_code, uid_str, invoice_no)
                self.stdout.write(self.style.SUCCESS(f"UID {uid_str} bağlandı: {order.order_code}"))

            if not dry_run:
                imap.expunge()
        finally:
            try:
                imap.logout()
            except Exception:
                pass

        summary = f"Bitti. eşleşen={matched} atlanan={skipped} eşleşmeyen={unmatched_n}"
        logger.info(summary)
        self.stdout.write(self.style.SUCCESS(summary))
