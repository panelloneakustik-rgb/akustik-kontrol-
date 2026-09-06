from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from .models import Address
from .serializers import (
    AddressSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": UserSerializer(user).data, **_tokens_for(user)},
            status=status.HTTP_201_CREATED,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"detail": "E-posta veya şifre hatalı."}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password):
        return Response({"detail": "E-posta veya şifre hatalı."}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({"user": UserSerializer(user).data, **_tokens_for(user)})


@api_view(["GET"])
@permission_classes([AllowAny])
def google_config(request):
    """Public OAuth client id — GIS needs it in the browser."""
    client_id = (settings.GOOGLE_CLIENT_ID or "").strip()
    return Response({"enabled": bool(client_id), "client_id": client_id or None})


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def google_login(request):
    """POST /api/auth/google/  body: {id_token: "<token from Google Identity Services>"}

    Verifies the token with Google, then logs in the matching user or creates
    a new one (no usable password -- they can only sign in via Google unless
    they later set one).
    """
    token = request.data.get("id_token")
    if not token:
        return Response({"detail": "id_token gerekli."}, status=status.HTTP_400_BAD_REQUEST)

    if not settings.GOOGLE_CLIENT_ID:
        return Response(
            {"detail": "Google girişi henüz yapılandırılmadı (GOOGLE_CLIENT_ID eksik)."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        payload = google_id_token.verify_oauth2_token(
            token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        return Response({"detail": "Geçersiz Google token."}, status=status.HTTP_401_UNAUTHORIZED)

    email = payload.get("email")
    if not email:
        return Response({"detail": "Google hesabından e-posta alınamadı."}, status=status.HTTP_400_BAD_REQUEST)
    if not payload.get("email_verified"):
        return Response({"detail": "Google e-posta doğrulanmamış."}, status=status.HTTP_400_BAD_REQUEST)

    full_name = payload.get("name", "")
    first_name, _, last_name = full_name.partition(" ")

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        user = User.objects.create_user(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_unusable_password()
        user.save()

    return Response({"user": UserSerializer(user).data, **_tokens_for(user)})


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me_view(request):
    if request.method == "PATCH":
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data["email"]
    user = User.objects.filter(email__iexact=email).first()
    if user and user.has_usable_password():
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_BASE_URL}/sifre-sifirla?uid={uid}&token={token}"
        send_mail(
            subject="Akustik Kontrol — şifre sıfırlama",
            message=(
                f"Şifrenizi sıfırlamak için bağlantıya tıklayın:\n{reset_url}\n\n"
                "Bu isteği siz yapmadıysanız bu e-postayı yok sayın."
            ),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@akustikkontrol.com"),
            recipient_list=[user.email],
            fail_silently=False,
        )
    return Response({"detail": "E-posta kayıtlıysa sıfırlama bağlantısı gönderildi."})


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def password_reset_confirm(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({"detail": "Geçersiz veya süresi dolmuş bağlantı."}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, serializer.validated_data["token"]):
        return Response({"detail": "Geçersiz veya süresi dolmuş bağlantı."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data["password"])
    user.save(update_fields=["password"])
    return Response({"detail": "Şifreniz güncellendi. Giriş yapabilirsiniz."})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def address_list(request):
    if request.method == "POST":
        serializer = AddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    qs = Address.objects.filter(user=request.user)
    return Response(AddressSerializer(qs, many=True).data)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def address_detail(request, address_id):
    address = Address.objects.filter(pk=address_id, user=request.user).first()
    if not address:
        return Response({"detail": "Adres bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "DELETE":
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = AddressSerializer(address, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)