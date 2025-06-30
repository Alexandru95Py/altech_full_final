import os
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile

class CompressPDFTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = self._create_user()
        self.client.force_authenticate(user=self.user)

        self.test_file_path = "test.pdf"
        with open(self.test_file_path, "wb") as f:
            f.write(b"%PDF-1.4\n%Test PDF content\n")

        self.uploaded_file = SimpleUploadedFile(
            name="test.pdf",
            content=open(self.test_file_path, "rb").read(),
            content_type="application/pdf",
        )

    def tearDown(self):
        if os.path.exists(self.test_file_path):
            os.remove(self.test_file_path)

    def _create_user(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        return User.objects.create_user(email="testuser@example.com", password="testpassword")

    def test_compress_pdf_low(self):
        response = self.client.post(
            reverse("compress-pdf"),
            {
                "file": self.uploaded_file,
                "compression_level": "low",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("original_size", response.data)
        self.assertIn("compressed_size", response.data)
        self.assertIn("reduction_percentage", response.data)

    def test_compress_pdf_medium(self):
        response = self.client.post(
            reverse("compress-pdf"),
            {
                "file": self.uploaded_file,
                "compression_level": "medium",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("original_size", response.data)
        self.assertIn("compressed_size", response.data)
        self.assertIn("reduction_percentage", response.data)

    def test_compress_pdf_high(self):
        response = self.client.post(
            reverse("compress-pdf"),
            {
                "file": self.uploaded_file,
                "compression_level": "high",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("original_size", response.data)
        self.assertIn("compressed_size", response.data)
        self.assertIn("reduction_percentage", response.data)

    def test_compress_pdf_invalid_file(self):
        invalid_file = SimpleUploadedFile(
            name="test.txt",
            content=b"Invalid content",
            content_type="text/plain",
        )

        response = self.client.post(
            reverse("compress-pdf"),
            {
                "file": invalid_file,
                "compression_level": "medium",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("file", response.data)
