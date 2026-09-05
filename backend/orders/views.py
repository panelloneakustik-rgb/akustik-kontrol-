from django.db import transaction
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from config.session_keys import parse_session_key
from products.models import Product
from .models import Cart, CartItem, Order, OrderItem, ReturnRequest
from .serializers import CartSerializer, OrderSerializer, ReturnRequestSerializer


def _cart_qty_for_product(cart, product, exclude_item_id=None):
    qs = cart.items.filter(product=product)
    if exclude_item_id:
        qs = qs.exclude(pk=exclude_item_id)
    return sum(item.quantity for item in qs)


def _ensure_stock(cart, product, desired_qty, exclude_item_id=None):
    other = _cart_qty_for_product(cart, product, exclude_item_id=exclude_item_id)
    if product.stock <= 0:
        return f"«{product.name}» stokta yok."
    if other + desired_qty > product.stock:
        return f"«{product.name}» için en fazla {product.stock - other} adet eklenebilir."
    return None


def _get_cart(session_key):
    cart, _ = Cart.objects.get_or_create(session_key=parse_session_key(session_key))
    return cart


@api_view(["GET"])
def cart_detail(request, session_key):
    """GET /api/cart/<session_key>/ -> current cart contents."""
    cart = _get_cart(session_key)
    return Response(CartSerializer(cart, context={"request": request}).data)

@api_view(["POST"])
def cart_add_item(request, session_key):
    """POST /api/cart/<session_key>/add/  body: {product: id, quantity: 1, variant_note: "B-130"}"""
    cart = _get_cart(session_key)
    product = get_object_or_404(Product, pk=request.data.get("product"))
    quantity = int(request.data.get("quantity", 1))
    variant_note = request.data.get("variant_note", "")
    if quantity < 1:
        return Response({"detail": "Geçersiz adet."}, status=status.HTTP_400_BAD_REQUEST)

    existing = CartItem.objects.filter(cart=cart, product=product, variant_note=variant_note).first()
    desired = quantity + (existing.quantity if existing else 0)
    stock_error = _ensure_stock(cart, product, desired, exclude_item_id=existing.pk if existing else None)
    if stock_error:
        return Response({"detail": stock_error}, status=status.HTTP_400_BAD_REQUEST)

    item, created = CartItem.objects.get_or_create(
        cart=cart, product=product, variant_note=variant_note, defaults={"quantity": quantity}
    )
    if not created:
        item.quantity += quantity
        item.save()

    return Response(CartSerializer(cart, context={"request": request}).data, status=status.HTTP_201_CREATED)

@api_view(["PATCH", "DELETE"])
def cart_item_detail(request, session_key, item_id):
    """PATCH body: {quantity: n} to update, DELETE to remove."""
    cart = _get_cart(session_key)
    item = get_object_or_404(CartItem, pk=item_id, cart=cart)

    if request.method == "DELETE":
        item.delete()
    else:
        quantity = int(request.data.get("quantity", item.quantity))
        if quantity <= 0:
            item.delete()
        else:
            stock_error = _ensure_stock(cart, item.product, quantity, exclude_item_id=item.pk)
            if stock_error:
                return Response({"detail": stock_error}, status=status.HTTP_400_BAD_REQUEST)
            item.quantity = quantity
            item.save()

    return Response(CartSerializer(cart, context={"request": request}).data)


@api_view(["POST"])
def checkout(request, session_key):
    """POST /api/cart/<session_key>/checkout/ -> creates an Order from the cart, empties it.

    If the request carries a valid JWT (user logged in), the order is linked to
    that user so it shows up in their order history. Guests can still check out.
    """
    cart = _get_cart(session_key)
    if not cart.items.exists():
        return Response({"detail": "Sepet boş."}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user if request.user.is_authenticated else None

    with transaction.atomic():
        items = list(cart.items.select_related("product"))
        for cart_item in items:
            product = Product.objects.select_for_update().get(pk=cart_item.product_id)
            if product.stock < cart_item.quantity:
                return Response(
                    {"detail": f"«{product.name}» stokta kalmadı. Sepeti güncelleyin."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        order = Order.objects.create(
            user=user,
            address_title=request.data.get("address_title", ""),
            first_name=request.data.get("first_name", ""),
            last_name=request.data.get("last_name", ""),
            email=request.data.get("email", ""),
            phone=request.data.get("phone", ""),
            mobile_phone=request.data.get("mobile_phone", ""),
            tc_kimlik_no=request.data.get("tc_kimlik_no", ""),
            country=request.data.get("country", "Türkiye"),
            city=request.data.get("city", ""),
            district=request.data.get("district", ""),
            address=request.data.get("address", ""),
            invoice_type=request.data.get("invoice_type", "individual"),
            company_name=request.data.get("company_name", ""),
            tax_office=request.data.get("tax_office", ""),
            tax_number=request.data.get("tax_number", ""),
        )
        for cart_item in items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                unit_price=cart_item.product.discounted_price,
                quantity=cart_item.quantity,
                variant_note=cart_item.variant_note,
            )
        order.reserve_stock()
        cart.items.all().delete()

    return Response(OrderSerializer(order, context={"request": request}).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """GET /api/orders/my/ -> orders placed by the logged-in user, newest first."""
    orders = Order.objects.filter(user=request.user).prefetch_related("items").order_by("-created_at")
    return Response(OrderSerializer(orders, many=True, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_invoice(request, order_id):
    """GET /api/orders/<id>/invoice/ -> PDF, only the order owner (or staff)."""
    order = Order.objects.filter(pk=order_id).first()
    if not order:
        return Response({"detail": "Sipariş bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
    if not (request.user.is_staff or order.user_id == request.user.id):
        return Response({"detail": "Bu faturaya erişim yetkiniz yok."}, status=status.HTTP_403_FORBIDDEN)
    if not order.invoice_pdf:
        return Response({"detail": "Bu sipariş için e-fatura henüz hazır değil."}, status=status.HTTP_404_NOT_FOUND)

    try:
        fh = order.invoice_pdf.open("rb")
    except FileNotFoundError as exc:
        raise Http404("Fatura dosyası bulunamadı.") from exc

    filename = f"{order.order_code or f'AK-{order.pk}'}-efatura.pdf"
    response = FileResponse(fh, content_type="application/pdf")
    response["Content-Disposition"] = f'inline; filename="{filename}"'
    return response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_return_request(request, order_id):
    """POST /api/orders/<order_id>/return-request/  body: {request_type, reason}

    Only the order's own owner can request a return/cancel on it.
    """
    order = Order.objects.filter(pk=order_id, user=request.user).first()
    if not order:
        return Response({"detail": "Sipariş bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

    request_type = request.data.get("request_type")
    reason = request.data.get("reason", "").strip()
    if request_type not in ("return", "cancel"):
        return Response({"detail": "Geçersiz talep türü."}, status=status.HTTP_400_BAD_REQUEST)
    if not reason:
        return Response({"detail": "Açıklama gerekli."}, status=status.HTTP_400_BAD_REQUEST)

    rr = ReturnRequest.objects.create(order=order, request_type=request_type, reason=reason)
    return Response(ReturnRequestSerializer(rr).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_return_requests(request):
    """GET /api/returns/my/ -> the logged-in user's return/cancel requests, newest first."""
    requests_qs = ReturnRequest.objects.filter(order__user=request.user).select_related("order")
    return Response(ReturnRequestSerializer(requests_qs, many=True).data)