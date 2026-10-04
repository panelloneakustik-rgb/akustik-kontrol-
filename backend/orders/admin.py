from io import StringIO

from django.contrib import admin, messages
from django.core.management import call_command
from django.core.management.base import CommandError
from django.db.models import Q
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils import timezone
from django.utils.html import format_html

from .invoice_inbox import imap_public_status
from .invoice_match import auto_attach_pdf
from .models import Cart, CartItem, Order, OrderItem, ReturnRequest


class HasInvoiceFilter(admin.SimpleListFilter):
    title = "e-fatura"
    parameter_name = "has_invoice"

    def lookups(self, request, model_admin):
        return (("yes", "Var"), ("waiting", "Yükleme bekliyor"))

    def queryset(self, request, queryset):
        if self.value() == "yes":
            return queryset.exclude(invoice_pdf="").exclude(invoice_pdf__isnull=True)
        if self.value() == "waiting":
            return queryset.filter(Q(invoice_pdf="") | Q(invoice_pdf__isnull=True)).filter(
                status__in=["paid", "shipped", "delivered"]
            )
        return queryset


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    change_list_template = "admin/orders/order/change_list.html"
    list_display = (
        "order_code",
        "full_name",
        "email",
        "status",
        "total",
        "fatura_kolonu",
        "created_at",
    )
    list_filter = ("status", HasInvoiceFilter, "cargo_company")
    search_fields = ("order_code", "email", "first_name", "last_name", "invoice_number", "tracking_number")
    readonly_fields = ("order_code", "invoice_matched_at", "invoice_email_uid", "stock_reserved")
    inlines = [OrderItemInline]
    fieldsets = (
        (
            "TÜRMOB e-Fatura",
            {
                "fields": ("invoice_pdf", "invoice_number", "invoice_matched_at"),
                "description": (
                    "Günlük iş: TÜRMOB PDF’sini fatura kutusuna mail at "
                    "(Siparişler → Fatura kutusu). Konu veya dosya adı AK-12 olsun. "
                    "Yedek: Toplu e-fatura."
                ),
            },
        ),
        (None, {"fields": ("user", "status", "order_code")}),
        (
            "Müşteri ve teslimat",
            {
                "classes": ("collapse",),
                "fields": (
                    "address_title", "first_name", "last_name", "email", "phone", "mobile_phone", "tc_kimlik_no",
                    "country", "city", "district", "address",
                    "invoice_type", "company_name", "tax_office", "tax_number",
                ),
            },
        ),
        ("Kargo", {"fields": ("cargo_company", "tracking_number")}),
        ("Sistem", {"classes": ("collapse",), "fields": ("invoice_email_uid", "stock_reserved")}),
    )
    actions = ("mark_paid_without_iyzico",)

    @admin.action(description="Ödendi yap (kart çekilmez — test)")
    def mark_paid_without_iyzico(self, request, queryset):
        n = 0
        for order in queryset:
            if order.status != "pending":
                continue
            order.status = "paid"
            order.save(update_fields=["status"])
            n += 1
        if n:
            self.message_user(
                request,
                f"{n} sipariş ödendi işaretlendi. Iyzico’dan para çekilmedi; e-fatura denemesi için.",
                messages.SUCCESS,
            )
        else:
            self.message_user(
                request,
                "Beklemede sipariş yoktu. Zaten ödenmiş veya iptal olanlar atlandı.",
                messages.WARNING,
            )

    def get_urls(self):
        custom = [
            path(
                "hizli-efatura/",
                self.admin_site.admin_view(self.quick_invoice_view),
                name="orders_order_quick_invoice",
            ),
            path(
                "fatura-kutusu/",
                self.admin_site.admin_view(self.invoice_inbox_view),
                name="orders_order_invoice_inbox",
            ),
        ]
        return custom + super().get_urls()

    @admin.display(description="E-fatura")
    def fatura_kolonu(self, obj):
        upload = reverse("admin:orders_order_quick_invoice") + f"?order={obj.pk}"
        if obj.has_invoice:
            return format_html(
                '<span style="color:#157347;font-weight:600">Hazır</span>'
                ' &nbsp; <a href="{}">Değiştir</a>',
                upload,
            )
        return format_html(
            '<a class="button" href="{}" style="white-space:nowrap">PDF yükle</a>',
            upload,
        )

    def quick_invoice_view(self, request):
        if not self.has_change_permission(request):
            from django.core.exceptions import PermissionDenied

            raise PermissionDenied
        waiting_qs = (
            Order.objects.filter(Q(invoice_pdf="") | Q(invoice_pdf__isnull=True))
            .filter(status__in=["paid", "shipped", "delivered"])
            .order_by("-created_at")
        )
        waiting = list(waiting_qs[:30])
        with_invoice = list(
            Order.objects.exclude(Q(invoice_pdf="") | Q(invoice_pdf__isnull=True))
            .order_by("-created_at")[:20]
        )
        selected_id = request.POST.get("order_id") or request.GET.get("order") or ""
        if selected_id:
            extra = Order.objects.filter(pk=selected_id).first()
            if extra and extra not in waiting:
                waiting = [extra] + waiting

        if request.method == "POST" and request.POST.get("auto_match"):
            files = request.FILES.getlist("invoice_pdfs")
            if not files:
                messages.error(request, "En az bir PDF seç.")
            else:
                overwrite = bool(request.POST.get("overwrite"))
                matched = skipped = failed = 0
                for uploaded in files:
                    result = auto_attach_pdf(
                        uploaded.name,
                        uploaded.read(),
                        overwrite=overwrite,
                    )
                    if result.ok:
                        matched += 1
                    elif result.skipped:
                        skipped += 1
                    else:
                        failed += 1
                        messages.error(request, f"{result.filename}: {result.detail}")
                if matched:
                    messages.success(
                        request,
                        f"{matched} fatura otomatik bağlandı. Sipariş listesinden tek tek seçmene gerek yok.",
                    )
                if skipped:
                    messages.warning(
                        request,
                        f"{skipped} dosya atlandı (o siparişte fatura zaten var). Üzerine yazmak için kutuyu işaretle.",
                    )
                if matched and not failed and not skipped:
                    return HttpResponseRedirect(reverse("admin:orders_order_changelist"))

        elif request.method == "POST":
            order_id = request.POST.get("order_id")
            pdf = request.FILES.get("invoice_pdf")
            number = (request.POST.get("invoice_number") or "").strip()
            if not order_id:
                messages.error(request, "Sipariş seç.")
            elif not pdf:
                messages.error(request, "TÜRMOB PDF dosyasını seç.")
            elif not str(pdf.name).lower().endswith(".pdf"):
                messages.error(request, "Sadece PDF yükle.")
            else:
                order = get_object_or_404(Order, pk=order_id)
                order.invoice_pdf.save(pdf.name, pdf, save=False)
                if number:
                    order.invoice_number = number
                order.invoice_matched_at = timezone.now()
                order.save(update_fields=["invoice_pdf", "invoice_number", "invoice_matched_at"])
                messages.success(
                    request,
                    f"{order.order_code or order.pk} e-faturası yüklendi. Müşteri Siparişlerim’den görür.",
                )
                return HttpResponseRedirect(reverse("admin:orders_order_changelist"))

        context = {
            **self.admin_site.each_context(request),
            "title": "Toplu e-fatura",
            "waiting": waiting,
            "with_invoice": with_invoice,
            "selected_id": str(selected_id),
            "opts": self.model._meta,
        }
        return TemplateResponse(request, "admin/orders/order/quick_invoice.html", context)

    def invoice_inbox_view(self, request):
        if not self.has_change_permission(request):
            from django.core.exceptions import PermissionDenied

            raise PermissionDenied
        status = imap_public_status()
        log_text = ""
        if request.method == "POST":
            action = request.POST.get("action")
            buf = StringIO()
            try:
                if action == "test":
                    call_command("check_invoice_emails", test_connection=True, stdout=buf)
                    messages.success(request, buf.getvalue().strip() or "Bağlantı tamam.")
                elif action == "read":
                    call_command("check_invoice_emails", stdout=buf)
                    messages.success(request, buf.getvalue().strip() or "Kutu okundu.")
                else:
                    messages.error(request, "Bilinmeyen işlem.")
            except CommandError as exc:
                messages.error(request, str(exc))
            except Exception as exc:
                messages.error(request, f"Kutu okunamadı: {exc}")
            log_text = buf.getvalue()
        context = {
            **self.admin_site.each_context(request),
            "title": "Fatura kutusu (e-posta)",
            "imap": status,
            "log_text": log_text,
            "opts": self.model._meta,
        }
        return TemplateResponse(request, "admin/orders/order/invoice_inbox.html", context)


@admin.register(ReturnRequest)
class ReturnRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "request_type", "status", "created_at")
    list_filter = ("request_type", "status")
    fields = ("order", "request_type", "reason", "status", "admin_note", "created_at")
    readonly_fields = ("order", "request_type", "reason", "created_at")


admin.site.register(Cart)
admin.site.register(CartItem)
