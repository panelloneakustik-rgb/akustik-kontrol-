from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from products.models import Category, Product, ProductVariant


class ProductVariantApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Süngerler", slug="sungerler")
        self.product = Product.objects.create(
            category=self.category,
            name="Piramit Sünger",
            slug="piramit-sunger",
            price=Decimal("100"),
            stock=0,
        )
        self.v40 = ProductVariant.objects.create(
            product=self.product,
            thickness="40 mm",
            dimensions="100x100 cm",
            price=Decimal("850"),
            stock=10,
            order=0,
        )
        self.v20 = ProductVariant.objects.create(
            product=self.product,
            thickness="20 mm",
            dimensions="100x100 cm",
            price=Decimal("500"),
            stock=4,
            order=1,
        )

    def test_detail_lists_variants_on_one_product(self):
        res = self.client.get("/api/products/piramit-sunger/")
        self.assertEqual(res.status_code, 200)
        labels = [v["label"] for v in res.data["variants"]]
        self.assertEqual(len(labels), 2)
        self.assertTrue(any("40 mm" in x for x in labels))
        self.assertTrue(any("20 mm" in x for x in labels))

    def test_list_option_count(self):
        res = self.client.get("/api/products/")
        row = next(p for p in res.data["results"] if p["slug"] == "piramit-sunger")
        self.assertEqual(row["option_count"], 2)

    def test_cart_uses_selected_variant_price_and_stock(self):
        add = self.client.post(
            "/api/cart/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/add/",
            {"product": self.product.id, "variant": self.v20.id, "quantity": 1},
            format="json",
        )
        self.assertEqual(add.status_code, 201)
        item = add.data["items"][0]
        self.assertEqual(item["variant"], self.v20.id)
        self.assertEqual(Decimal(item["unit_price"]), Decimal("500.00"))
        self.assertIn("20 mm", item["variant_note"])

        over = self.client.post(
            "/api/cart/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/add/",
            {"product": self.product.id, "variant": self.v20.id, "quantity": 4},
            format="json",
        )
        self.assertEqual(over.status_code, 400)

    def test_add_requires_variant_when_several_exist(self):
        res = self.client.post(
            "/api/cart/bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee/add/",
            {"product": self.product.id, "quantity": 1},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
