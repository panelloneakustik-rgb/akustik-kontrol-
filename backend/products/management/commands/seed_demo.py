from django.core.management.base import BaseCommand
from products.models import Category, Product


CATEGORIES = ["Koltuk", "Kose Koltuk", "TV Koltugu", "Berjer", "Karyola", "Masa", "TV Unitesi", "Kitaplik", "Sehpa", "Dekoratif"]

PRODUCTS = [
    ("Rava Lambaderli Sehpa", "Sehpa", 34500, 25, True, True),
    ("Flora Tekli Koltuk (Outdoor)", "Koltuk", 58528, 25, True, True),
    ("Marzen Ayakli Boy Aynasi", "Dekoratif", 41840, 25, True, True),
    ("Rava Abajur", "Dekoratif", 15950, 25, True, True),
    ("Sole Bar", "Dekoratif", 71033, 25, True, True),
    ("Velora Corner", "Kose Koltuk", 160019, 50, False, False),
]


class Command(BaseCommand):
    help = "Seed demo categories & products so the frontend has something to render."

    def handle(self, *args, **options):
        cat_objs = {}
        for i, name in enumerate(CATEGORIES):
            cat, _ = Category.objects.get_or_create(name=name, defaults={"order": i})
            cat_objs[name] = cat

        for name, cat_name, price, discount, is_new, is_bestseller in PRODUCTS:
            Product.objects.get_or_create(
                name=name,
                defaults=dict(
                    category=cat_objs[cat_name],
                    price=price,
                    discount_percent=discount,
                    is_new=is_new,
                    is_bestseller=is_bestseller,
                    stock=10,
                ),
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(CATEGORIES)} categories and {len(PRODUCTS)} products."))
