from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()


class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="ali@example.com",
            email="ali@example.com",
            password="GizliSifre123",
        )

    def test_reset_request_sends_mail_for_existing_user(self):
        res = self.client.post("/api/auth/password-reset/", {"email": "ali@example.com"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("sifre-sifirla", mail.outbox[0].body)

    def test_reset_request_unknown_email_still_ok(self):
        res = self.client.post("/api/auth/password-reset/", {"email": "yok@example.com"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_reset_confirm_updates_password(self):
        self.client.post("/api/auth/password-reset/", {"email": "ali@example.com"}, format="json")
        body = mail.outbox[0].body
        uid = body.split("uid=")[1].split("&")[0]
        token = body.split("token=")[1].split()[0]
        res = self.client.post(
            "/api/auth/password-reset/confirm/",
            {
                "uid": uid,
                "token": token,
                "password": "YeniSifre123",
                "password_confirm": "YeniSifre123",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("YeniSifre123"))


class AddressBookTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="ali@example.com",
            email="ali@example.com",
            password="GizliSifre123",
        )
        login = self.client.post(
            "/api/auth/login/",
            {"email": "ali@example.com", "password": "GizliSifre123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    def test_create_list_delete_address(self):
        payload = {
            "title": "Ev",
            "first_name": "Ali",
            "last_name": "Yılmaz",
            "phone": "",
            "mobile_phone": "05551112233",
            "city": "İstanbul",
            "district": "Kadıköy",
            "address": "Moda Cad. 1",
            "is_default": True,
        }
        created = self.client.post("/api/auth/addresses/", payload, format="json")
        self.assertEqual(created.status_code, 201)
        listed = self.client.get("/api/auth/addresses/")
        self.assertEqual(len(listed.data), 1)
        addr_id = created.data["id"]
        deleted = self.client.delete(f"/api/auth/addresses/{addr_id}/")
        self.assertEqual(deleted.status_code, 204)
        listed = self.client.get("/api/auth/addresses/")
        self.assertEqual(len(listed.data), 0)
