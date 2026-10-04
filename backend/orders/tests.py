from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from orders.invoice_inbox import process_rfc822
from orders.models import Order
from products.models import Category, Product

User = get_user_model()


class StockAndCheckoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Panel")
        self.product = Product.objects.create(
            category=self.category,
            name="Akustik Panel",
            price=100,
            stock=2,
        )
        self.session = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"

    def _add(self, qty=1):
        return self.client.post(
            f"/api/cart/{self.session}/add/",
            {"product": self.product.id, "quantity": qty},
            format="json",
        )

    def test_add_rejects_when_out_of_stock(self):
        self.product.stock = 0
        self.product.save()
        res = self._add(1)
        self.assertEqual(res.status_code, 400)
        self.assertIn("stok", res.data["detail"].lower())

    def test_add_rejects_over_stock(self):
        res = self._add(3)
        self.assertEqual(res.status_code, 400)

    def test_checkout_decrements_stock(self):
        add = self._add(2)
        self.assertEqual(add.status_code, 201)
        res = self.client.post(
            f"/api/cart/{self.session}/checkout/",
            {
                "first_name": "Ali",
                "last_name": "Yılmaz",
                "email": "ali@example.com",
                "mobile_phone": "05551112233",
                "city": "İstanbul",
                "district": "Kadıköy",
                "address": "Moda 1",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 0)
        self.assertTrue(res.data.get("order_code", "").startswith("AK-"))


class FakeInvoiceTrialTests(TestCase):
    """Sahte PDF ile admin yükleme + müşteri indirme (TÜRMOB kesmeden)."""

    def setUp(self):
        self.admin = User.objects.create_superuser("admin", "admin@example.com", "pass12345")
        self.buyer = User.objects.create_user("buyer", "buyer@example.com", "pass12345")
        self.order = Order.objects.create(
            user=self.buyer,
            first_name="Deneme",
            last_name="Musteri",
            email="buyer@example.com",
            address="Test sokak 1",
            city="İstanbul",
            district="Kadıköy",
            mobile_phone="05550000000",
            status="paid",
        )
        self.admin_client = Client()
        self.admin_client.force_login(self.admin)

    def _pdf(self, name="deneme.pdf"):
        return SimpleUploadedFile(
            name,
            b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n%%EOF\n",
            content_type="application/pdf",
        )

    def test_quick_upload_then_owner_can_download(self):
        url = reverse("admin:orders_order_quick_invoice")
        res = self.admin_client.post(
            url,
            {
                "order_id": str(self.order.pk),
                "invoice_number": "SAHTE-DENEME-1",
                "invoice_pdf": self._pdf(),
            },
        )
        self.assertEqual(res.status_code, 302)
        self.order.refresh_from_db()
        self.assertTrue(self.order.has_invoice)
        self.assertEqual(self.order.invoice_number, "SAHTE-DENEME-1")
        self.assertIsNotNone(self.order.invoice_matched_at)

        api = APIClient()
        api.force_authenticate(self.buyer)
        dl = api.get(f"/api/orders/{self.order.pk}/invoice/")
        self.assertEqual(dl.status_code, 200)
        self.assertEqual(dl["Content-Type"], "application/pdf")

        stranger = User.objects.create_user("other", "other@example.com", "pass12345")
        api.force_authenticate(stranger)
        blocked = api.get(f"/api/orders/{self.order.pk}/invoice/")
        self.assertEqual(blocked.status_code, 403)

    def test_rejects_non_pdf(self):
        url = reverse("admin:orders_order_quick_invoice")
        res = self.admin_client.post(
            url,
            {
                "order_id": str(self.order.pk),
                "invoice_pdf": SimpleUploadedFile(
                    "not-pdf.txt", b"hello", content_type="text/plain"
                ),
            },
        )
        self.assertEqual(res.status_code, 200)
        self.order.refresh_from_db()
        self.assertFalse(self.order.has_invoice)

    def test_admin_can_mark_pending_paid_without_iyzico(self):
        pending = Order.objects.create(
            user=self.buyer,
            first_name="Deneme",
            last_name="Musteri",
            email="buyer@example.com",
            address="Test sokak 1",
            city="İstanbul",
            district="Kadıköy",
            mobile_phone="05550000000",
            status="pending",
        )
        url = reverse("admin:orders_order_changelist")
        res = self.admin_client.post(
            url,
            {
                "action": "mark_paid_without_iyzico",
                "_selected_action": [str(pending.pk)],
            },
        )
        self.assertEqual(res.status_code, 302)
        pending.refresh_from_db()
        self.assertEqual(pending.status, "paid")

    def test_auto_match_many_pdfs_by_filename_without_picking_orders(self):
        second = Order.objects.create(
            user=self.buyer,
            first_name="Deneme",
            last_name="Iki",
            email="buyer@example.com",
            address="Test sokak 1",
            city="İstanbul",
            district="Kadıköy",
            mobile_phone="05550000000",
            status="paid",
        )
        self.order.refresh_from_db()
        second.refresh_from_db()
        url = reverse("admin:orders_order_quick_invoice")
        res = self.admin_client.post(
            url,
            {
                "auto_match": "1",
                "invoice_pdfs": [
                    self._pdf(f"{self.order.order_code}.pdf"),
                    self._pdf(f"{second.order_code}.pdf"),
                ],
            },
        )
        self.assertEqual(res.status_code, 302)
        self.order.refresh_from_db()
        second.refresh_from_db()
        self.assertTrue(self.order.has_invoice)
        self.assertTrue(second.has_invoice)

    def test_auto_match_reports_when_code_missing(self):
        url = reverse("admin:orders_order_quick_invoice")
        res = self.admin_client.post(
            url,
            {"auto_match": "1", "invoice_pdfs": self._pdf("fatura.pdf")},
        )
        self.assertEqual(res.status_code, 200)
        self.order.refresh_from_db()
        self.assertFalse(self.order.has_invoice)

    def test_invoice_inbox_page_loads(self):
        url = reverse("admin:orders_order_invoice_inbox")
        res = self.admin_client.get(url)
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "panellone.akustik@gmail.com")

    def test_email_attachment_filename_binds_order(self):
        self.order.refresh_from_db()
        mail = MIMEMultipart()
        mail["Subject"] = "TÜRMOB e-fatura"
        mail["From"] = "fatura@example.com"
        mail["To"] = "kutu@example.com"
        pdf = MIMEApplication(
            b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n%%EOF\n",
            _subtype="pdf",
        )
        pdf.add_header(
            "Content-Disposition",
            "attachment",
            filename=f"{self.order.order_code}.pdf",
        )
        mail.attach(pdf)
        result = process_rfc822(mail.as_bytes())
        self.assertEqual(result.status, "matched")
        self.order.refresh_from_db()
        self.assertTrue(self.order.has_invoice)

    def test_email_without_code_is_unmatched(self):
        mail = MIMEMultipart()
        mail["Subject"] = "fatura"
        pdf = MIMEApplication(b"%PDF-1.4\n%%EOF\n", _subtype="pdf")
        pdf.add_header("Content-Disposition", "attachment", filename="fatura.pdf")
        mail.attach(pdf)
        result = process_rfc822(mail.as_bytes())
        self.assertIn(result.status, ("unmatched", "no_pdf"))
        self.order.refresh_from_db()
        self.assertFalse(self.order.has_invoice)
