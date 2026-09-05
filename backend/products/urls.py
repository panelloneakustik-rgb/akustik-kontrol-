from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, StoryViewSet,HeroSlideViewSet,favorites_list, favorites_toggle

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("stories", StoryViewSet, basename="story")
router.register("hero-slides", HeroSlideViewSet, basename="hero-slide")
urlpatterns = router.urls + [
    path("favorites/<str:session_key>/", favorites_list, name="favorites-list"),
    path("favorites/<str:session_key>/toggle/", favorites_toggle, name="favorites-toggle"),
]