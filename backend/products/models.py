from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify

class Category(models.Model):
    """e.g. Sünger, Kumaş Kaplı Duvar paneli..."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=110, unique=True, blank=True)
    icon = models.ImageField(upload_to="categories/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ColorSwatch(models.Model):
    """A reusable fabric/color option (e.g. B-130) that products can offer."""
    code = models.CharField(max_length=20, unique=True, help_text="e.g. B-130")
    name = models.CharField(max_length=100, blank=True, help_text="Optional friendly name, e.g. Lacivert")
    image = models.ImageField(upload_to="swatches/")

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return self.name or self.code

class Product(models.Model):
    category = models.ForeignKey(Category, related_name="products", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)

    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Original price (TL)")
    discount_percent = models.PositiveIntegerField(default=0, help_text="e.g. 25 for %25 Indirim")

    image = models.ImageField(upload_to="products/", blank=True, null=True)

    is_new = models.BooleanField(default=False, help_text="Shows the 'Yeni Urun' badge")
    is_bestseller = models.BooleanField(default=False, help_text="Featured in 'Cok Satanlar'")
    stock = models.PositiveIntegerField(default=0)

    # Technical specs shown in the product-detail spec table (all optional)
    dimensions = models.CharField(max_length=100, blank=True, help_text="e.g. 60 x 30 x 4 cm")
    material = models.CharField(max_length=100, blank=True, help_text="e.g. Kumaş kaplı sünger")
    color = models.CharField(max_length=100, blank=True, help_text="e.g. Antrasit Gri")
    color_swatches = models.ManyToManyField(
        ColorSwatch, blank=True, related_name="products",
        help_text="Kumaş/renk seçenekleri -- seçiliyse ürün sayfasında müşteri renk seçmek zorunda kalır."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def discounted_price(self):
        if self.discount_percent:
            return round(self.price * (100 - self.discount_percent) / 100, 2)
        return self.price


class ProductImage(models.Model):
    """Extra gallery images for a product (shown on hover-cycle in the product card)."""
    product = models.ForeignKey(Product, related_name="gallery_images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="products/gallery/")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.product.name} - image {self.order}"

    
class Favorite(models.Model):
    """Session-based wishlist entry -- same anonymous session_key pattern as the cart."""
    session_key = models.CharField(max_length=64)
    product = models.ForeignKey(Product, related_name="favorited_by", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("session_key", "product")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.session_key} ♥ {self.product.name}"
class Story(models.Model):
    """Instagram-story-style circles shown under the header — independent of Category."""
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to="stories/")
    link_url = models.CharField(max_length=200, blank=True, help_text="Optional: e.g. /kategori/sungerler")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title

class HeroSlide(models.Model):
    """One slide in the homepage hero banner carousel."""
    image = models.ImageField(upload_to="hero/")
    badge_text = models.CharField(max_length=50, blank=True, help_text="e.g. Yeni Koleksiyon")
    title = models.CharField(max_length=150, blank=True, help_text="e.g. Akustik Panel Sistemleri")
    subtitle = models.CharField(max_length=200, blank=True, help_text="e.g. Şıklık ve Sessizlik Bir Arada")
    cta_text = models.CharField(max_length=50, blank=True, help_text="e.g. Ürünleri Gör (leave blank to hide button)")
    cta_link = models.CharField(max_length=200, blank=True, help_text="e.g. /urunler")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title or f"Hero slide #{self.pk}"

class Review(models.Model):
    """A logged-in customer's rating/comment on a product. One review per user per product."""
    product = models.ForeignKey(Product, related_name="reviews", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="reviews", on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    is_approved = models.BooleanField(default=True, help_text="Uncheck to hide this review from the site without deleting it.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("product", "user")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} -> {self.product.name} ({self.rating}★)"    