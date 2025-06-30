from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from django.core.files.storage import default_storage
from functools import wraps
from create_pdf.utils.pdf_generator import (
    generate_basic_pdf,
    generate_pdf_with_image,
    generate_pdf_with_table
)

# create_pdf/tests/authenticated_testcase.py

from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token  # sau JWT dacă folosești altceva
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import permissions


ALLOW_ALL_ACCESS = True  # Toate funcțiile sunt disponibile pentru toți utilizatorii

class IsPremiumUser(permissions.BasePermission):
    def has_permission(self, request, view):
        from .permissions import ALLOW_ALL_ACCESS
        if ALLOW_ALL_ACCESS:
            return True
        return bool(request.user and request.user.is_autenticated and request.user_is_premium)



User = get_user_model()

class AuthenticatedAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword123'
        )
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)

def premium_required(view_func):
    @wraps(view_func)
    def _wrapped_view(self, request, *args, **kwargs):
        if ALLOW_ALL_ACCESS:
            return view_func(self, request, *args, **kwargs)

        user = request.user
        if hasattr(user, "is_authenticated") and user.is_authenticated:
            if hasattr(user, "profile") and getattr(user.profile, "is_premium", False):
                return view_func(self, request, *args, **kwargs)

        return Response(
            {"error": "Această funcționalitate este disponibilă doar pentru utilizatorii Pro."},
            status=status.HTTP_403_FORBIDDEN
        )
    return _wrapped_view

class CreateBasicPDFView(APIView):
    def post(self, request):
        title = request.data.get("title", "Document")
        content = request.data.get("content", "")

        if not content.strip():
            return Response({"error": "Conținutul nu poate fi gol."}, status=400)

        pdf_path = generate_basic_pdf(title, content)
        return serve_pdf(pdf_path)


class CreatePDFWithImageView(APIView):
    def post(self, request):
        title = request.data.get("title", "Document cu imagine")
        content = request.data.get("content", "")
        image = request.FILES.get("image")

        if not image:
            return Response({"error": "Trebuie să încarci o imagine."}, status=400)

        image_path = default_storage.save(f"temp/{image.name}", image)
        pdf_path = generate_pdf_with_image(title, content, image_path)
        return serve_pdf(pdf_path)


class CreatePDFWithTableView(APIView):
    def post(self, request):
        title = request.data.get("title", "Tabel PDF")
        headers = request.data.get("headers", [])
        rows = request.data.get("rows", [])

        if not headers or not rows:
            return Response({"error": "Tabelul trebuie să conțină headere și rânduri."}, status=400)

        pdf_path = generate_pdf_with_table(title, headers, rows)
        return serve_pdf(pdf_path)


# Funcție utilitară pentru returnare PDF
def serve_pdf(path):
    with open(path, "rb") as pdf:
        response = HttpResponse(pdf.read(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="creatie.pdf"'
        return response