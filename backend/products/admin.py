from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product, ProductImage, Story, HeroSlide, ColorSwatch, Review, ProductVariant


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(ColorSwatch)
class ColorSwatchAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "preview")
    search_fields = ("code", "name")

    def preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:32px;height:32px;object-fit:cover;border-radius:4px;" />',
                obj.image.url,
            )
        return "-"

    preview.short_description = "Önizleme"


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 2
    fields = ("image", "order", "preview")
    readonly_fields = ("preview",)

    def preview(self, obj):
        if obj.pk and obj.image:
            return format_html(
                '<img src="{}" style="width:64px;height:64px;object-fit:cover;" />',
                obj.image.url,
            )
        return "Kaydettikten sonra görünür"

    preview.short_description = "Önizleme"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 2
    fields = ("order", "thickness", "dimensions", "density", "color", "price", "discount_percent", "stock")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "thumb",
        "name",
        "category",
        "price",
        "discount_percent",
        "is_new",
        "is_bestseller",
        "stock",
        "shipping_days",
        "variant_count",
    )
    list_display_links = ("thumb", "name")
    list_filter = ("category", "is_new", "is_bestseller")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("color_swatches",)
    inlines = [ProductVariantInline, ProductImageInline]
    fieldsets = (
        (None, {"fields": ("category", "name", "slug", "description", "image")}),
        (
            "Ortak özellikler",
            {
                "fields": ("product_model", "material", "production"),
                "description": "Model, yapı ve üretim tüm varyantlarda aynıdır. Kalınlık, ebat, yoğunluk, renk, fiyat ve stok aşağıda her satır için ayrı girilir.",
            },
        ),
        ("Durum", {"fields": ("is_new", "is_bestseller")}),
        (
            "Kargo",
            {
                "fields": ("shipping_days",),
                "description": "Bu ürünün kargoya verilme süresi. Her ürün için ayrı seçilir.",
            },
        ),
        (
            "Kumaş / renk örnekleri",
            {
                "fields": ("color_swatches",),
                "description": "Müşteri kumaş kodu seçecekse buraya ekle. Kalınlık ve ebat için üstteki varyant satırlarını kullan.",
            },
        ),
    )

    def thumb(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:48px;height:48px;object-fit:cover;" />',
                obj.image.url,
            )
        return "-"

    thumb.short_description = "Görsel"

    def variant_count(self, obj):
        return obj.variants.count()

    variant_count.short_description = "Varyant"

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        obj = form.instance
        if not obj.variants.exists():
            ProductVariant.objects.create(
                product=obj,
                price=obj.price,
                discount_percent=obj.discount_percent,
                stock=obj.stock,
                thickness=obj.thickness,
                dimensions=obj.dimensions,
                density=obj.density,
                color=obj.color,
            )


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ("thumb", "title", "has_video", "link_url", "order")
    list_editable = ("order",)
    list_display_links = ("thumb", "title")
    fields = ("title", "image", "video", "link_url", "order")

    def thumb(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:48px;height:48px;object-fit:cover;border-radius:999px;" />',
                obj.image.url,
            )
        if obj.video:
            return "Video"
        return "-"

    thumb.short_description = "Kapak"

    def has_video(self, obj):
        return bool(obj.video)

    has_video.boolean = True
    has_video.short_description = "Video"


@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ("title", "badge_text", "order")
    list_editable = ("order",)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "visibility", "created_at")
    list_filter = ("visibility", "rating")
    list_editable = ("visibility",)
    search_fields = ("product__name", "user__email", "comment")
    readonly_fields = ("product", "user", "rating", "comment", "created_at")
    radio_fields = {"visibility": admin.VERTICAL}
    fieldsets = (
        (None, {"fields": ("product", "user", "rating", "comment", "created_at")}),
        (
            "Yayın",
            {
                "fields": ("visibility",),
                "description": "Herkese: ürün sayfasında herkes görür. Sadece bana: yalnızca bu panelde durur. Yazan müşteri kendi yorumunu Hesabım → Sorularım ve ürün sayfasında her zaman görür.",
            },
        ),
    )
