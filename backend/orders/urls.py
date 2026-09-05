from django.urls import path
from . import views
from . import payment_views

urlpatterns = [
    path("cart/<str:session_key>/", views.cart_detail, name="cart-detail"),
    path("cart/<str:session_key>/add/", views.cart_add_item, name="cart-add"),
    path("cart/<str:session_key>/items/<int:item_id>/", views.cart_item_detail, name="cart-item-detail"),
    path("cart/<str:session_key>/checkout/", views.checkout, name="cart-checkout"),
    path("orders/my/", views.my_orders, name="my-orders"),
    path("orders/<int:order_id>/invoice/", views.download_invoice, name="order-invoice"),
    path("orders/<int:order_id>/pay/", payment_views.initialize_payment, name="order-pay"),
    path("orders/<int:order_id>/return-request/", views.create_return_request, name="order-return-request"),
    path("returns/my/", views.my_return_requests, name="my-return-requests"),
]