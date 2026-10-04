"""IMAP: TÜRMOB e-fatura PDF eklerini sipariş koduna (AK-123) bağlar.

Operasyon:
  1. TÜRMOB açıklamasına sipariş kodunu yaz (AK-1042)
  2. PDF'i fatura kutusuna ilet / BCC
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
from django.core.management.base import BaseCommand, CommandError

from orders.invoice_inbox import process_rfc822
from orders.invoice_mail import extract_invoice_number, extract_order_codes, extract_pdf_text
from orders.invoice_match import attach_invoice_pdf, find_order

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
    user = (getattr(settings, "IMAP_USER", "") or "").strip().strip("'").strip('"')
    password = (getattr(settings, "IMAP_PASSWORD", "") or "").strip().strip("'").strip('"').replace(" ", "")
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
        raise CommandError(
            f"IMAP girişi başarısız ({user}, şifre {len(password)} karakter, beklenen 16). "
            "Gmail’de IMAP açık olsun; uygulama şifresini tırnak içinde yaz: "
            'IMAP_PASSWORD="xxxxxxxxxxxxxxxx". '
            f"Google: {exc}"
        ) from exc
    return imap


def _ensure_folder(imap: imaplib.IMAP4_SSL, name: str):
    typ, _ = imap.create(name)
    if typ not in ("OK", "NO"):
        raise CommandError(f"Klasör oluşturulamadı: {name}")


def _move_uid(imap: imaplib.IMAP4_SSL, uid: bytes, dest: str):
    imap.uid("COPY", uid, dest)
    imap.uid("STORE", uid, "+FLAGS", r"(\Seen \Deleted)")


class Command(BaseCommand):
    help = "Fatura kutusundaki PDF'leri siparişlere bağlar (TÜRMOB e-fatura)."

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

        codes = extract_order_codes(path.name, text)
        if options["order_code"]:
            codes = [options["order_code"].upper().replace(" ", "")] + codes

        order = find_order(codes)
        if not order:
            raise CommandError(f"Sipariş bulunamadı. PDF'deki kodlar: {codes or '-'}")

        invoice_no = extract_invoice_number(text)
        if options["dry_run"]:
            self.stdout.write(f"[dry-run] {path.name} -> {order.order_code} no={invoice_no or '-'}")
            return

        if order.invoice_pdf and not options["overwrite"]:
            raise CommandError(f"{order.order_code} zaten faturalı. --overwrite kullanın.")

        attach_invoice_pdf(order, path.name, pdf_bytes, invoice_no, uid_str="local-file")
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
                result = process_rfc822(
                    raw, overwrite=overwrite, uid_str=uid_str, dry_run=dry_run
                )
                if result.status == "matched":
                    matched += 1
                    if not dry_run:
                        _move_uid(imap, uid, processed)
                    logger.info("%s uid=%s", result.detail, uid_str)
                    self.stdout.write(self.style.SUCCESS(f"UID {uid_str} {result.detail}"))
                elif result.status == "skipped":
                    skipped += 1
                    if not dry_run:
                        _move_uid(imap, uid, processed)
                    self.stdout.write(f"UID {uid_str}: {result.detail}")
                else:
                    unmatched_n += 1
                    if not dry_run:
                        _move_uid(imap, uid, unmatched)
                    self.stdout.write(self.style.WARNING(f"UID {uid_str}: {result.detail}"))

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
