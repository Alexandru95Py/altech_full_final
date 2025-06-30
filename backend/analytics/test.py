from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import UserSession, PDFAction, FeatureUsage, DailyStatistics
from django .core.files.uploadedfile import SimpleUploadedFile
from custom_auth.models import CustomUser 
from django.contrib.auth import get_user_model

User = get_user_model()


class AnalyticsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="test@example.com", password="test1234")
        self.client.force_authenticate(user=self.user)
        
    def test_start_session(self):
        response = self.client.post('/analytics/start-session/', {})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('session_id', response.data)

    def test_end_session(self):
        session = UserSession.objects.create()
        response = self.client.post(f'/analytics/end-session/{session.session_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        session.refresh_from_db()
        

    def test_pdf_action(self):
        session = UserSession.objects.create()
        data = {
            'session': session.id,
            'action_type': 'split'
        }

        response = self.client.post('/analytics/pdf-action/', data)
        print("STATUS:", response.status_code)
        print("RESPONSE:", response.data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.post('/analytics/pdf-action/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_feature_usage(self):
        data = {'feature_name': 'merge', 'usage_count': 1}
        response = self.client.post('/analytics/feature-usage/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_daily_statistics(self):
        DailyStatistics.objects.create(total_actions=10)
        response = self.client.get('/analytics/daily-statistics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
