from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from support.models import SupportTicket
from altech_pdf.test_utils import create_test_user
from rest_framework_simplejwt.tokens import AccessToken

class SupportTicketTests(APITestCase):
    def setUp(self):
        self.user = create_test_user()
        self.token = str(AccessToken.for_user(self.user))
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.url = reverse('submit_support_ticket')

    def test_create_support_ticket_success(self):
        data = {
            "subject": "Problema cu PDF-ul",
            "message": "Nu pot încărca fișierul PDF."
        }
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "Cererea ta a fost trimisă cu succes.")
        self.assertEqual(SupportTicket.objects.count(), 1)
        self.assertEqual(SupportTicket.objects.first().user, self.user)

    def test_create_support_ticket_invalid_data(self):
        # Lipsesc câmpurile obligatorii
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("subject", response.data)
        self.assertIn("message", response.data)

    def test_support_ticket_requires_authentication(self):
        self.client.logout()
        data = {
            "subject": "Problema cu aplicația",
            "message": "Am întâmpinat o eroare."
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)