from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Q
from config.session_keys import parse_session_key
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, Favorite, HeroSlide, Story, Review  # (senin mevcut import'larına göre)
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    HeroSlideSerializer,
    StorySerializer,
    ReviewSerializer,
    MyReviewSerializer,
)



class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"


class HeroSlideViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HeroSlide.objects.all()
    serializer_class = HeroSlideSerializer

class StoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StorySerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.select_related("category").prefetch_related("gallery_images").all()
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category__slug", "is_new", "is_bestseller"]
    search_fields = ["name", "description"]
    ordering_fields = ["price", "created_at"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticatedOrReadOnly], url_path="reviews")
    def reviews(self, request, slug=None):
        """
        GET  /api/products/<slug>/reviews/  -> approved reviews for this product
        POST /api/products/<slug>/reviews/  body: {rating: 1-5, comment: str}
             -> creates or updates the logged-in user's own review (one per user per product)
        """
        product = self.get_object()

        if request.method == "POST":
            rating = request.data.get("rating")
            comment = (request.data.get("comment") or "").strip()
            try:
                rating = int(rating)
            except (TypeError, ValueError):
                rating = None
            if not rating or rating < 1 or rating > 5:
                return Response({"detail": "1 ile 5 arasında bir puan gerekli."}, status=status.HTTP_400_BAD_REQUEST)
            if not comment:
                return Response({"detail": "Yorum metni gerekli."}, status=status.HTTP_400_BAD_REQUEST)

            review, created = Review.objects.update_or_create(
                product=product, user=request.user,
                defaults={
                    "rating": rating,
                    "comment": comment,
                    "visibility": Review.VISIBILITY_ADMIN,
                },
            )
            return Response(
                ReviewSerializer(review, context={"request": request}).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )

        qs = product.reviews.select_related("user")
        if request.user.is_authenticated:
            qs = qs.filter(Q(visibility=Review.VISIBILITY_EVERYONE) | Q(user=request.user))
        else:
            qs = qs.filter(visibility=Review.VISIBILITY_EVERYONE)
        return Response(ReviewSerializer(qs, many=True, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_reviews(request):
    """GET /api/reviews/my/ -> the logged-in user's product comments, newest first."""
    qs = Review.objects.filter(user=request.user).select_related("product")
    return Response(MyReviewSerializer(qs, many=True, context={"request": request}).data)


@api_view(["GET"])
def favorites_list(request, session_key):
    """GET /api/favorites/<session_key>/ -> favorited products + their ids."""
    session_key = parse_session_key(session_key)
    products = Product.objects.filter(favorited_by__session_key=session_key).select_related("category")
    return Response({
        "product_ids": list(products.values_list("id", flat=True)),
        "products": ProductListSerializer(products, many=True, context={"request": request}).data,
    })


@api_view(["POST"])
def favorites_toggle(request, session_key):
    """POST /api/favorites/<session_key>/toggle/  body: {product: id}"""
    session_key = parse_session_key(session_key)
    product = Product.objects.filter(pk=request.data.get("product")).first()
    if not product:
        return Response({"detail": "Ürün bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

    existing = Favorite.objects.filter(session_key=session_key, product=product).first()
    if existing:
        existing.delete()
        favorited = False
    else:
        Favorite.objects.create(session_key=session_key, product=product)
        favorited = True

    return Response({"favorited": favorited, "product_id": product.id})