"""iyzico Checkout Form integration.

Flow:
1. Frontend calls POST /api/orders/<id>/pay/ (after the order is created via
   the normal checkout endpoint, status="pending"). We ask iyzico to start a
   Checkout Form session and return the HTML/script it gives us.
2. Frontend renders that HTML in a page -- it shows iyzico's own hosted card
   form inside an iframe. The buyer never types card details into our site.
3. When the buyer finishes, their browser is POSTed by iyzico to
   /api/payment/callback/ with a "token". We ask iyzico "how did that
   payment go" (retrieve), mark the Order as paid/cancelled accordingly, and
   redirect the browser to a results page on the frontend.
"""
import iyzipay
from django.conf import settings
from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Order


def _iyzico_options():
    return {
        "api_key": settings.IYZICO_API_KEY,
        "secret_key": settings.IYZICO_SECRET_KEY,
        "base_url": settings.IYZICO_BASE_URL,
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def initialize_payment(request, order_id):
    """POST /api/orders/<order_id>/pay/ -> {checkout_form_content: "<script>...</script>"}"""
    if not settings.IYZICO_API_KEY:
        return Response(
            {"detail": "Ödeme sistemi henüz yapılandırılmadı (IYZICO_API_KEY eksik)."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        order = Order.objects.prefetch_related("items").get(pk=order_id)
    except Order.DoesNotExist:
        return Response({"detail": "Sipariş bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

    if order.user_id:
        if not request.user.is_authenticated or request.user.id != order.user_id:
            return Response({"detail": "Bu sipariş için ödeme yetkiniz yok."}, status=status.HTTP_403_FORBIDDEN)

    items = list(order.items.select_related("product"))
    if not items:
        return Response({"detail": "Siparişte ürün yok."}, status=status.HTTP_400_BAD_REQUEST)

    basket_items = []
    for i, item in enumerate(items):
        basket_items.append({
            "id": str(item.product_id or f"item-{i}"),
            "name": item.product_name[:100],
            "category1": "Genel",
            "itemType": "PHYSICAL",
            "price": str(item.subtotal),
        })

    total_str = str(order.total)

    request_data = {
        "locale": "tr",
        "conversationId": str(order.id),
        "price": total_str,
        "paidPrice": total_str,
        "currency": "TRY",
        "basketId": str(order.id),
        "paymentGroup": "PRODUCT",
        "callbackUrl": request.build_absolute_uri("/api/payment/callback/"),
        "enabledInstallments": [1],
        "buyer": {
            "id": f"buyer-{order.id}",
            "name": order.first_name or "Musteri",
            "surname": order.last_name or "Musteri",
            "gsmNumber": order.mobile_phone or order.phone or "+905000000000",
            "email": order.email,
            "identityNumber": order.tc_kimlik_no or "11111111111",
            "registrationAddress": order.address,
            "ip": request.META.get("REMOTE_ADDR", "127.0.0.1"),
            "city": order.city or "Istanbul",
            "country": "Turkey",
        },
        "shippingAddress": {
            "contactName": order.full_name,
            "city": order.city or "Istanbul",
            "country": "Turkey",
            "address": order.address,
        },
        "billingAddress": {
            "contactName": order.full_name,
            "city": order.city or "Istanbul",
            "country": "Turkey",
            "address": order.address,
        },
        "basketItems": basket_items,
    }

    checkout_form = iyzipay.CheckoutFormInitialize()
    result = checkout_form.create(request_data, _iyzico_options())
    result_data = result.read().decode("utf-8")

    import json
    parsed = json.loads(result_data)

    if parsed.get("status") != "success":
        return Response(
            {"detail": parsed.get("errorMessage", "Ödeme başlatılamadı.")},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"checkout_form_content": parsed.get("checkoutFormContent")})


@csrf_exempt
def payment_callback(request):
    """POST target that iyzico redirects the buyer's browser to after checkout."""
    token = request.POST.get("token")
    if not token:
        return HttpResponseRedirect(f"{settings.FRONTEND_BASE_URL}/siparis-sonuc?status=error")

    retrieve_request = {"locale": "tr", "token": token}
    checkout_form = iyzipay.CheckoutForm()
    result = checkout_form.retrieve(retrieve_request, _iyzico_options())

    import json
    parsed = json.loads(result.read().decode("utf-8"))

    conversation_id = parsed.get("conversationId")
    payment_status = parsed.get("paymentStatus")

    order = Order.objects.filter(pk=conversation_id).first()
    if order:
        if payment_status == "SUCCESS":
            order.status = "paid"
        else:
            order.status = "cancelled"
        order.save()

    outcome = "success" if payment_status == "SUCCESS" else "failed"
    return HttpResponseRedirect(
        f"{settings.FRONTEND_BASE_URL}/siparis-sonuc?status={outcome}&order={conversation_id or ''}"
    )