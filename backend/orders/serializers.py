from config.media import absolute_file_url
from rest_framework import serializers
from products.models import Product
from .models import Cart, CartItem, Order, OrderItem, ReturnRequest


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.SerializerMethodField()
    unit_price = serializers.DecimalField(source="product.discounted_price", max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    stock = serializers.IntegerField(source="product.stock", read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_name", "product_image", "unit_price", "quantity", "variant_note", "subtotal", "stock"]

    def get_product_image(self, obj):
        if not obj.product:
            return None
        return absolute_file_url(self.context.get("request"), obj.product.image)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "session_key", "items", "total"]


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "product_image", "unit_price", "quantity","variant_note", "subtotal"]
        read_only_fields = ["product_name", "unit_price"]

    def get_product_image(self, obj):
        if not obj.product or not obj.product.image:
            return None
        return absolute_file_url(self.context.get("request"), obj.product.image)


class ReturnRequestSerializer(serializers.ModelSerializer):
    request_type_display = serializers.CharField(source="get_request_type_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    order_id = serializers.IntegerField(source="order.id", read_only=True)
    order_total = serializers.DecimalField(source="order.total", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ReturnRequest
        fields = [
            "id", "order", "order_id", "order_total", "request_type", "request_type_display",
            "reason", "status", "status_display", "admin_note", "created_at",
        ]
        read_only_fields = ["status", "status_display", "admin_note", "created_at"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    full_name = serializers.CharField(read_only=True)
    invoice_type_display = serializers.CharField(source="get_invoice_type_display", read_only=True)
    has_invoice = serializers.BooleanField(read_only=True)
    invoice_status = serializers.CharField(read_only=True)
    order_code = serializers.CharField(read_only=True)
    tracking_url = serializers.CharField(read_only=True)
    cargo_company_display = serializers.CharField(source="get_cargo_company_display", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "order_code", "address_title", "first_name", "last_name", "full_name",
            "email", "phone", "mobile_phone", "tc_kimlik_no",
            "country", "city", "district", "address",
            "invoice_type", "invoice_type_display", "company_name", "tax_office", "tax_number",
            "status", "status_display", "items", "total", "created_at",
            "has_invoice", "invoice_status", "invoice_number",
            "cargo_company", "cargo_company_display", "tracking_number", "tracking_url",
        ]
        read_only_fields = [
            "status", "status_display", "created_at",
            "order_code", "has_invoice", "invoice_status", "invoice_number",
            "cargo_company", "tracking_number", "tracking_url",
        ]