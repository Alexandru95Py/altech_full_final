from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from io import BytesIO
from reportlab.pdfgen import canvas
from PIL import Image
import tempfile
import json

User = get_user_model()

def create_pdf_file(name="test.pdf"):
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    p.drawString(100, 750, "Hello, PDF!")
    p.showPage()
    p.save()
    buffer.seek(0)
    return SimpleUploadedFile(name, buffer.read(), content_type="application/pdf")

def create_image_file(name="signature.png"):
    image = Image.new("RGB", (100, 50), color="black")
    temp = tempfile.NamedTemporaryFile(suffix=".png")
    image.save(temp, format="PNG")
    temp.seek(0)
    return SimpleUploadedFile(name, temp.read(), content_type="image/png")

class FillAndSignTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@example.com", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.pdf_file = create_pdf_file()
        self.signature_image = create_image_file()

    def test_fill_pdf_success(self):
        url = reverse("fill_and_sign:fill_pdf")
        data = {
            "file": self.pdf_file,
            "fields": json.dumps({
                "nume": "Alex",
                "email": "alex@test.com"
            })
        }

        response = self.client.post(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("file_path", response.json())

    def test_sign_pdf_success(self):
        url = reverse("fill_and_sign:sign_pdf")
        data = {
            "file": self.pdf_file,
            "signature_image": self.signature_image,
            "page": 0,
            "x": 100,
            "y": 150
        }
        response = self.client.post(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("file_path", response.json())

    def test_fill_pdf_invalid(self):
        url = reverse("fill_and_sign:fill_pdf")
        data = {}  # lipsesc toate datele
        response = self.client.post(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sign_pdf_invalid(self):
        url = reverse("fill_and_sign:sign_pdf")
        data = {
            "file": self.pdf_file,
            "page": 1,
            "x": 100,
            "y": 150
        }  # lipseÈte imaginea semnÄturii
        response = self.client.post(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)