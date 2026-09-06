from config.media import absolute_file_url
from rest_framework import serializers
from .models import Category, Product, ProductImage, HeroSlide, ColorSwatch, Review, Story


class CategorySerializer(serializers.ModelSerializer):
    icon = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon", "order"]

    def get_icon(self, obj):
        return absolute_file_url(self.context.get("request"), obj.icon)


class ColorSwatchSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ColorSwatch
        fields = ["id", "code", "name", "image"]

    def get_image(self, obj):
        return absolute_file_url(self.context.get("request"), obj.image)


class HeroSlideSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = HeroSlide
        fields = ["id", "image", "badge_text", "title", "subtitle", "cta_text", "cta_link", "order"]

    def get_image(self, obj):
        return absolute_file_url(self.context.get("request"), obj.image)

class StorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = ["id", "title", "image", "link_url", "order"]

    def get_image(self, obj):
        return absolute_file_url(self.context.get("request"), obj.image) 


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    is_verified_purchase = serializers.SerializerMethodField()
    is_own = serializers.SerializerMethodField()
    is_public = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id", "user_name", "rating", "comment", "is_verified_purchase",
            "visibility", "is_public", "is_own", "created_at",
        ]

    def get_user_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        if full_name:
            parts = full_name.split(" ")
            if len(parts) > 1:
                return f"{parts[0]} {parts[-1][0]}."
            return parts[0]
        return obj.user.email.split("@")[0]

    def get_is_verified_purchase(self, obj):
        from orders.models import Order
        return Order.objects.filter(
            user=obj.user, items__product=obj.product, status__in=["paid", "shipped", "delivered"]
        ).exists()

    def get_is_own(self, obj):
        request = self.context.get("request")
        return bool(request and getattr(request.user, "is_authenticated", False) and obj.user_id == request.user.id)

    def get_is_public(self, obj):
        return obj.visibility == Review.VISIBILITY_EVERYONE


class MyReviewSerializer(serializers.ModelSerializer):
    """Logged-in user's own reviews, including the product they commented on."""
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id", "product_name", "product_slug", "product_image",
            "rating", "comment", "visibility", "created_at",
        ]

    def get_product_image(self, obj):
        return absolute_file_url(self.context.get("request"), obj.product.image)


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image", "order"]

    def get_image(self, obj):
        return absolute_file_url(self.context.get("request"), obj.image)


class ProductListSerializer(serializers.ModelSerializer):
    """Compact shape used on the product-grid / bestsellers cards."""
    category = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    discounted_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    gallery_images = ProductImageSerializer(many=True, read_only=True)
    images = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "category", "image", "images", "gallery_images",
            "price", "discount_percent", "discounted_price",
            "is_new", "is_bestseller", "stock",
        ]

    def get_image(self, obj):
        return absolute_file_url(self.context.get("request"), obj.image)

    def get_images(self, obj):
        request = self.context.get("request")
        urls = []
        main = absolute_file_url(request, obj.image)
        if main:
            urls.append(main)
        for gi in obj.gallery_images.all():
            extra = absolute_file_url(request, gi.image)
            if extra:
                urls.append(extra)
        return urls


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    discounted_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    gallery_images = ProductImageSerializer(many=True, read_only=True)
    images = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    related_products = serializers.SerializerMethodField()
    color_swatches = ColorSwatchSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "category", "description", "image", "images", "gallery_images",
            "price", "discount_percent", "discounted_price",
            "is_new", "is_bestseller", "stock", "shipping_days",
            "density", "dimensions", "thickness", "product_model", "production",
            "material", "color", "color_swatches",
            "average_rating", "review_count",
            "related_products",
        ]

    def get_image(self, obj):
        return absolute_file_url(self.context.get("request"), obj.image)

    def get_images(self, obj):
        request = self.context.get("request")
        urls = []
        main = absolute_file_url(request, obj.image)
        if main:
            urls.append(main)
        for gi in obj.gallery_images.all():
            extra = absolute_file_url(request, gi.image)
            if extra:
                urls.append(extra)
        return urls

    def get_related_products(self, obj):
        qs = Product.objects.filter(category=obj.category).exclude(pk=obj.pk).select_related("category")[:4]
        return ProductListSerializer(qs, many=True, context=self.context).data

    def get_average_rating(self, obj):
        approved = obj.reviews.filter(visibility="everyone")
        if not approved.exists():
            return None
        return round(sum(r.rating for r in approved) / approved.count(), 1)

    def get_review_count(self, obj):
        return obj.reviews.filter(visibility="everyone").count()