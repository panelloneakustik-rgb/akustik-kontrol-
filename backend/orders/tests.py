from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

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
        self.session = "test-session-key"

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
