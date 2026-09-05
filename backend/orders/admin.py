from django.contrib import admin
from django.db.models import Q
from .models import Cart, CartItem, Order, OrderItem, ReturnRequest


class HasInvoiceFilter(admin.SimpleListFilter):
    title = "e-fatura"
    parameter_name = "has_invoice"

    def lookups(self, request, model_admin):
        return (("yes", "Var"), ("no", "Yok"))

    def queryset(self, request, queryset):
        if self.value() == "yes":
            return queryset.exclude(invoice_pdf="").exclude(invoice_pdf__isnull=True)
        if self.value() == "no":
            return queryset.filter(Q(invoice_pdf="") | Q(invoice_pdf__isnull=True))
        return queryset


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_code", "full_name", "user", "email", "status", "cargo_company", "tracking_number", "has_invoice", "total", "created_at")
    list_filter = ("status", "cargo_company", HasInvoiceFilter)
    search_fields = ("order_code", "email", "first_name", "last_name", "invoice_number", "tracking_number")
    readonly_fields = ("order_code", "invoice_matched_at", "invoice_email_uid", "stock_reserved")
    inlines = [OrderItemInline]
    fields = (
        "user", "status", "order_code",
        "address_title", "first_name", "last_name", "email", "phone", "mobile_phone", "tc_kimlik_no",
        "country", "city", "district", "address",
        "invoice_type", "company_name", "tax_office", "tax_number",
        "cargo_company", "tracking_number",
        "invoice_pdf", "invoice_number", "invoice_matched_at", "invoice_email_uid", "stock_reserved",
    )


@admin.register(ReturnRequest)
class ReturnRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "request_type", "status", "created_at")
    list_filter = ("request_type", "status")
    fields = ("order", "request_type", "reason", "status", "admin_note", "created_at")
    readonly_fields = ("order", "request_type", "reason", "created_at")


admin.site.register(Cart)
admin.site.register(CartItem)