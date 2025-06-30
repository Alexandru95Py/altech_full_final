from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.uploadedfile import SimpleUploadedFile
import os
from django.conf import settings
import os
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile


from create_pdf.permissions import AuthenticatedAPITestCase

class FreePDFTests(AuthenticatedAPITestCase):

    def setUp(self):
        super().setUp()
        self.basic_url = "/api/create/free/basic/"
        self.image_url = "/api/create/free/image/"
        self.table_url = "/api/create/free/table/"

    def test_create_basic_pdf(self):
        data = {
            "title": "Test Document",
            "content": "Aceasta este o linie.\nȘi încă una."
        }
        response = self.client.post(self.basic_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("application/pdf", response["Content-Type"])

    from django.core.files.uploadedfile import SimpleUploadedFile

    def test_create_pdf_with_image(self):
        # Imagine PNG validă (1x1 pixel)
        valid_png = (
            b"\x89PNG\r\n\x1a\n"
            b"\x00\x00\x00\rIHDR"
            b"\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
            b"\x00\x00\x00\nIDATx\xdacd\xf8\x0f\x00\x01\x01\x01\x00\x18\xdd\x8d\xe3"
            b"\x00\x00\x00\x00IEND\xaeB`\x82"
        )

        image = SimpleUploadedFile("test.png", valid_png, content_type="image/png")

        data = {
            "title": "Imagine PDF",
            "content": "Text cu imagine",
            "image": image
        }

        response = self.client.post(
            self.image_url,
            data,
            format="multipart",
            
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
            

        

    
    def test_create_pdf_with_image(self):
        image_path = os.path.join(
            settings.BASE_DIR, "create_pdf", "tests", "assets", "test_imagine.png"
        )

        with open(image_path, "rb") as img:
            image_file = SimpleUploadedFile("test_imagine.png", img.read(), content_type="image/png")

        data = {
            "title": "Imagine PDF",
            "content": "Text cu imagine",
            "image": image_file
        }

        response = self.client.post(self.image_url, data, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)