import io
import os
from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from PyPDF2 import PdfWriter
from altech_pdf.test_utils import create_test_user, generate_test_pdf
from reportlab.pdfgen import canvas
from io import BytesIO
import django
from file_manager.models import File


def setUpModule():
    django.setup()


def generate_valid_pdf(name="test.pdf"):
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    p.drawString(100, 750, "Hello PDF")
    p.showPage()
    p.save()
    buffer.seek(0)
    return SimpleUploadedFile(name, buffer.read(), content_type='application/pdf')


class BasePDFTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        pdf_writer = PdfWriter()
        pdf_writer.add_blank_page(width=72, height=72)
        stream = io.BytesIO()
        pdf_writer.write(stream)
        stream.seek(0)
        self.test_pdf = SimpleUploadedFile("test.pdf", stream.read(), content_type="application/pdf")


# SPLIT --------------------------
class SplitPDFTests(APITestCase):
    def test_split_pdf_invalid_data(self):
        user = create_test_user(plan="pro")
        self.client.force_authenticate(user=user)

        response = self.client.post("/pro/split/", data={}, format="multipart")
        self.assertEqual(response.status_code, 400)

    def test_split_pdf_success(self):
        user = create_test_user(plan="pro")
        self.client.force_authenticate(user=user)

        test_pdf = generate_valid_pdf("sample.pdf")
        response = self.client.post("/pro/split/", {
            "file": test_pdf,
            "start_page": 1,
            "end_page": 1
        }, format="multipart")

        self.assertEqual(response.status_code, 200)
        self.assertIn("file_path", response.json())


# MERGE --------------------------
class MergePDFTests(BasePDFTestCase):
    def test_merge_pdf_invalid_data(self):
        user = create_test_user(plan="free")
        self.client.force_authenticate(user=user)

        # trimitem un string în loc de fișier valid
        response = self.client.post("/basic/merge/", {
            'files': ['not_a_file']
        }, format="multipart")

        print("Status code:", response.status_code)
        print("Response JSON:", response.json())

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json()) 

    def test_merge_pdf_unauthorized(self):
        client = APIClient()
        response = client.post("/basic/merge/", {}, format="multipart")
        self.assertIn(response.status_code, [401, 403])


# DELETE --------------------------
    def test_delete_pdf_invalid_data(self):
        user = create_test_user(plan="pro")
        self.client.force_authenticate(user=user)

        response = self.client.post("/basic/delete/", {
            'file': self.test_pdf,
            'pages_to_delete': []
        }, format="multipart")

        self.assertEqual(response.status_code, 400)

    def test_delete_pdf_success(self):
        user = create_test_user(plan="pro")
        self.client.force_authenticate(user=user)

        response = self.client.post("/basic/delete/", {
            'file': self.test_pdf,
            'pages_to_delete': [1]
        }, format="multipart")

        self.assertEqual(response.status_code, 200)
        self.assertIn("file_path", response.json())

    def test_delete_pdf_unauthorized(self):
        client = APIClient()
        response = client.post("/basic/delete/", {}, format="multipart")
        self.assertIn(response.status_code, [401, 403])


# REORDER --------------------------
class ReorderPDFTests(BasePDFTestCase):
    def test_reorder_pdf_invalid_data(self):
        user = create_test_user(plan="pro")
        self.client.force_authenticate(user=user)

        response = self.client.post("/pro/reorder/", {
            'file': self.test_pdf,
            'new_order': []
        }, format="multipart")

        try:
            print("Response JSON:", response.json())
        except Exception:
            print("Response Content:", response.content.decode())

        self.assertEqual(response.status_code, 400)

    def test_reorder_pdf_success(self):
        user = create_test_user(plan="pro")
        self.client.force_authenticate(user=user)

        response = self.client.post("/pro/reorder/", {
            'file': self.test_pdf,
            'new_order': [1]
        }, format="multipart")

        try:
            print("Response JSON:", response.json())
        except Exception:
            print("Response Content:", response.content.decode())

        self.assertEqual(response.status_code, 200)
        self.assertIn("file_path", response.json())

    def test_reorder_pdf_unauthorized(self):
        client = APIClient()
        response = client.post("/basic/reorder/", {}, format="multipart")
        self.assertIn(response.status_code, [401, 403])


# COMPRESS --------------------------
class CompressPDFTests(BasePDFTestCase):
    def test_compress_pdf_invalid_data(self):
        user = create_test_user(plan="basic")
        self.client.force_authenticate(user=user)

        response = self.client.post("/api/compress/", data={}, format="multipart")
        self.assertEqual(response.status_code, 400)

    def test_compress_pdf_success(self):
        user = create_test_user(plan="basic")
        self.client.force_authenticate(user=user)

        test_pdf = generate_valid_pdf("compress_sample.pdf")
        response = self.client.post("/basic/compress/api/compress/", {
            "file": test_pdf,
            "compression_level": "medium",
            "user": user.id
        }, format="multipart")

        self.assertEqual(response.status_code, 200)
        self.assertIn("file_path", response.json())
        self.assertIn("compression_stats", response.json())

    def test_extract_pages_success(self):
        user = create_test_user(plan="basic")
        self.client.force_authenticate(user=user)

        test_pdf = generate_valid_pdf("extract_sample.pdf")
        file = File.objects.create(
            name="extract_sample.pdf",
            file=test_pdf,
            user=user
        )

        response = self.client.post("/basic/extract_pages/", {
            "file_id": file.id,
            "pages": "1,2"
        }, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertIn("extracted_file", response.json())
        self.assertIn("extracted_pages", response.json())

    def test_extract_pages_invalid_file(self):
        user = create_test_user(plan="basic")
        self.client.force_authenticate(user=user)

        response = self.client.post("/basic/extract_pages/", {
            "file_id": 9999,
            "pages": "1,2"
        }, format="json")

        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.json())
