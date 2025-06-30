# create_pdf/tests/test_ai.py

from rest_framework.test import APITestCase
from rest_framework import status
from create_pdf.permissions import AuthenticatedAPITestCase
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

class AIAssistantTests(AuthenticatedAPITestCase):
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user( password="testpassword", email="example@email.com")
        self.token = str(AccessToken.for_user(self.user))
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + self.token)

        self.url = "/api/create/ai/assistant/"  # sau endpoint-ul tău real
    

      
    def test_table_command(self):
        data = {"command": "crează tabel"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data["suggestions"][0])
        self.assertEqual(response.data["suggestions"][0]["type"], "table")

    def test_text_command(self):
        data = {"command": "scrie introducere"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["suggestions"][0]["type"], "text")

    def test_image_command(self):
        data = {"command": "adaugă imagine"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["suggestions"][0]["type"], "image")

    def test_unknown_command(self):
        data = {"command": "xyz necunoscut"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["suggestions"][0]["type"], "hint")