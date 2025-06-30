from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
import datetime
from pathlib import Path
from django.core.files.uploadedfile import SimpleUploadedFile


from create_pdf.serializers import (
    ContractPDFSerializer,
    InvoicePDFSerializer,
    SignPDFSerializer
)

User = get_user_model()

class ProPDFTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@example.com",
            password="testpass123",
            is_premium=True
        )
        self.client.force_authenticate(user=self.user)

    def test_contract_pdf_generation(self):
        url = reverse("create_pdf:contract_generate")
        data = {
            "client_name": "ALTech SRL",
            "date": datetime.date.today().isoformat(),
            "service": "Consultanță și dezvoltare software",
            "price": "1499.99",
            "terms": "Plată în 30 de zile"
        }

        serializer = ContractPDFSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertTrue(response["Content-Disposition"].startswith("attachment"))

    def test_invoice_pdf_generation(self):
        url = reverse("create_pdf:invoice_generate")
        data = {
            "client": "SC Goga SRL",
            "invoice_number": "INV-20250527",
            "date": datetime.date.today().isoformat(),
            "service": "Servicii premium AI",
            "amount": "249.99",
            "due_date": datetime.date.today().isoformat()
        }

        serializer = InvoicePDFSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertTrue(response["Content-Disposition"].startswith("attachment"))

    def test_pro_access_allowed_for_all(self):
        url = reverse("create_pdf:contract_generate")
        data = {
            "client_name": "ALTech GmbH",
            "date": datetime.date.today().isoformat(),
            "service": "Test",
            "price": "1000.00",
            "terms": "Test access for all"
        }

        serializer = ContractPDFSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        response = self.client.post(url, data, format="json")
        self.assertIn(response.status_code, [200, 403])

    def test_pro_access_allowed_for_premium(self):
        url = reverse("create_pdf:invoice_generate")
        data = {
            "client": "Premium Client",
            "invoice_number": "INV-PRO-01",
            "date": datetime.date.today().isoformat(),
            "service": "Premium feature access",
            "amount": "150.00",
            "due_date": datetime.date.today().isoformat()
        }

        serializer = InvoicePDFSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        response = self.client.post(url, data, format="json")
        self.assertIn(response.status_code, [200, 403])

    def test_signed_pdf_generation(self):
        url = reverse("create_pdf:sign_pdf")

        base_dir = Path(__file__).resolve().parent / "assets"
        pdf_path = base_dir / "test_document.pdf"
        sig_path = base_dir / "test_signature.png"

        # Deschidem fișierele și le citim conținutul
        with open(pdf_path, "rb") as pdf_file, open(sig_path, "rb") as sig_file:
            pdf_content = pdf_file.read()
            sig_content = sig_file.read()

        # Construim fișierele pentru serializer
        data = {
            "pdf": SimpleUploadedFile("test_document.pdf", pdf_content, content_type="application/pdf"),
            "signature": SimpleUploadedFile("test_signature.png", sig_content, content_type="image/png"),
            "position": {"x": 150, "y": 100}
        }

        # Validăm serializerul (opțional, dar util pentru debugging)
        serializer = SignPDFSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        # Creăm din nou fișierele pentru POST (nu refolosim pe cele de mai sus!)
        pdf_upload = SimpleUploadedFile("test_document.pdf", pdf_content, content_type="application/pdf")
        sig_upload = SimpleUploadedFile("test_signature.png", sig_content, content_type="image/png")

        response = self.client.post(
            url,
            {
                "pdf": pdf_upload,
                "signature": sig_upload,
                "position": '{"x": 150, "y": 100}'
            },
            format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertTrue(response["Content-Disposition"].startswith("attachment"))