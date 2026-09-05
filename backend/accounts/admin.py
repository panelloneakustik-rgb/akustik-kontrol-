from django.contrib import admin
from .models import Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "city", "district", "is_default")
    list_filter = ("city", "is_default")
    search_fields = ("title", "user__email", "address")
