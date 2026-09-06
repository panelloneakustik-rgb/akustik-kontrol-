from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.login_view, name="login"),
    path("google/config/", views.google_config, name="google-config"),
    path("google/", views.google_login, name="google-login"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.me_view, name="me"),
    path("password-reset/", views.password_reset_request, name="password-reset"),
    path("password-reset/confirm/", views.password_reset_confirm, name="password-reset-confirm"),
    path("addresses/", views.address_list, name="address-list"),
    path("addresses/<int:address_id>/", views.address_detail, name="address-detail"),
]