import uuid
from pathlib import Path

from django.db import models
from django.conf import settings
from products.models import Product
from .storage import PrivateInvoiceStorage


def invoice_upload_to(instance, filename):
    ext = Path(filename).suffix.lower() or ".pdf"
    code = instance.order_code or f"order-{instance.pk or 'new'}"
    return f"invoices/{code}_{uuid.uuid4().hex}{ext}"



class Cart(models.Model):
    """Session-based cart, identified by a client-generated session key."""
    session_key = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart({self.session_key})"

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    variant_note = models.CharField(max_length=100, blank=True, help_text="e.g. selected color code, 'B-130'")

    class Meta:
        unique_together = ("cart", "product", "variant_note")

    @property
    def subtotal(self):
        return self.product.discounted_price * self.quantity

    def __str__(self):
        suffix = f" ({self.variant_note})" if self.variant_note else ""
        return f"{self.quantity} x {self.product.name}{suffix}"


CARGO_CHOICES = [
    ("", "Belirtilmedi"),
    ("yurtici", "Yurtiçi Kargo"),
    ("aras", "Aras Kargo"),
    ("mng", "MNG Kargo"),
    ("ptt", "PTT Kargo"),
    ("surat", "Sürat Kargo"),
    ("ups", "UPS"),
    ("other", "Diğer"),
]

CARGO_TRACK_URLS = {
    "yurtici": "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={code}",
    "aras": "https://kargotakip.araskargo.com.tr/mainpage.aspx?code={code}",
    "mng": "https://kargotakip.mngkargo.com.tr/?query={code}",
    "ptt": "https://gonderitakip.ptt.gov.tr/Track/Verify?q={code}",
    "surat": "https://www.suratkargo.com.tr/KargoTakip/?kargotakipno={code}",
    "ups": "https://www.ups.com/track?loc=tr_TR&tracknum={code}",
}


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Beklemede"),
        ("paid", "Odendi"),
        ("shipped", "Kargoda"),
        ("delivered", "Teslim Edildi"),
        ("cancelled", "Iptal"),
    ]
    INVOICE_TYPE_CHOICES = [
        ("individual", "Bireysel"),
        ("company", "Kurumsal"),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="orders", on_delete=models.SET_NULL,
        null=True, blank=True, help_text="Set automatically if the buyer was logged in at checkout."
    )

    address_title = models.CharField(max_length=100, blank=True, help_text="e.g. Ev, İş")
    first_name = models.CharField(max_length=100, default="")
    last_name = models.CharField(max_length=100, default="")
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True, help_text="Sabit telefon (opsiyonel)")
    mobile_phone = models.CharField(max_length=30, default="")
    tc_kimlik_no = models.CharField(max_length=11, blank=True, help_text="Fatura için gerekli")

    country = models.CharField(max_length=100, default="Türkiye")
    city = models.CharField(max_length=100, default="")
    district = models.CharField(max_length=100, default="")
    address = models.TextField()

    invoice_type = models.CharField(max_length=20, choices=INVOICE_TYPE_CHOICES, default="individual")
    company_name = models.CharField(max_length=200, blank=True)
    tax_office = models.CharField(max_length=100, blank=True)
    tax_number = models.CharField(max_length=20, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    order_code = models.CharField(
        max_length=20, unique=True, null=True, blank=True,
        help_text="Luca açıklamasına yazılacak kod, örn. AK-1042",
    )
    invoice_pdf = models.FileField(
        storage=PrivateInvoiceStorage(),
        upload_to=invoice_upload_to,
        blank=True,
        null=True,
    )
    invoice_number = models.CharField(max_length=64, blank=True)
    invoice_matched_at = models.DateTimeField(null=True, blank=True)
    invoice_email_uid = models.CharField(max_length=64, blank=True)
    stock_reserved = models.BooleanField(default=False)
    cargo_company = models.CharField(max_length=20, choices=CARGO_CHOICES, blank=True)
    tracking_number = models.CharField(max_length=64, blank=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def has_invoice(self):
        return bool(self.invoice_pdf)

    @property
    def invoice_status(self):
        if self.has_invoice:
            return "ready"
        if self.status in ("paid", "shipped", "delivered"):
            return "pending"
        return "none"

    def save(self, *args, **kwargs):
        previous_status = None
        if self.pk:
            previous_status = (
                Order.objects.filter(pk=self.pk).values_list("status", flat=True).first()
            )
        if self.tracking_number and self.status == "paid":
            self.status = "shipped"
        super().save(*args, **kwargs)
        if not self.order_code:
            self.order_code = f"AK-{self.pk}"
            super().save(update_fields=["order_code"])
        if previous_status and previous_status != "cancelled" and self.status == "cancelled":
            self.release_stock()

    def __str__(self):
        return f"{self.order_code or f'Order #{self.pk}'} - {self.full_name}"

    @property
    def tracking_url(self):
        if not self.tracking_number:
            return ""
        template = CARGO_TRACK_URLS.get(self.cargo_company)
        if not template:
            return ""
        return template.format(code=self.tracking_number)

    def reserve_stock(self):
        from django.db.models import F

        if self.stock_reserved:
            return
        for item in self.items.select_related("product"):
            if item.product_id:
                Product.objects.filter(pk=item.product_id).update(stock=F("stock") - item.quantity)
        self.stock_reserved = True
        super().save(update_fields=["stock_reserved"])

    def release_stock(self):
        from django.db.models import F

        if not self.stock_reserved:
            return
        for item in self.items.select_related("product"):
            if item.product_id:
                Product.objects.filter(pk=item.product_id).update(stock=F("stock") + item.quantity)
        self.stock_reserved = False
        super().save(update_fields=["stock_reserved"])

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    variant_note = models.CharField(max_length=100, blank=True, help_text="e.g. selected color code, 'B-130'")
    @property
    def subtotal(self):
        return self.unit_price * self.quantity
class ReturnRequest(models.Model):
    """A customer's request to return or cancel an order."""
    TYPE_CHOICES = [
        ("return", "İade"),
        ("cancel", "İptal"),
    ]
    STATUS_CHOICES = [
        ("pending", "İnceleniyor"),
        ("approved", "Onaylandı"),
        ("rejected", "Reddedildi"),
        ("completed", "Tamamlandı"),
    ]
    order = models.ForeignKey(Order, related_name="return_requests", on_delete=models.CASCADE)
    request_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    admin_note = models.TextField(blank=True, help_text="Internal note, visible to the customer once set")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_request_type_display()} - Order #{self.order_id}"