from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from notifications.models import Notification
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from file_manager.models import File

class NotificationTests(APITestCase):

 

    def setUp(self):

        User = get_user_model()

        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123"
        )
        self.test_pdf = SimpleUploadedFile("test.pdf", b"%PDF-1.4 PDF content", content_type="application/pdf")
        self.client.force_login(self.user)

    def test_create_notification(self):
        notification = Notification.objects.create(
            user=self.user,
            title="Test Notification",
            message="This is a test."
        )
        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(notification.title, "Test Notification")

    def test_list_notifications(self):
        self.client.force_authenticate(user=self.user)

        Notification.objects.create(user=self.user, title="Title", message="Message")
        url = reverse("notifications_base:notification_list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)
        def test_list_unread_notifications(self):
            Notification.objects.create(user=self.user, title="Unread", message="You have unread", is_read=False)
            Notification.objects.create(user=self.user, title="Read", message="Read", is_read=True)

            url = reverse("notifications_base:notification_unread_list")
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), 1)

    def test_mark_notification_as_read(self):
        self.client.force_authenticate(user=self.user)  # <- înlocuiește sau adaugă asta

        notification = Notification.objects.create(
            user=self.user,
            title="Mark me",
            is_read=False
        )
        url = reverse("notifications_base:notification_mark_read", kwargs={"pk": notification.pk})
        response = self.client.patch(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_notification(self):
        notification = Notification.objects.create(user=self.user, title="Delete me")

        url = reverse("notifications_base:notification_delete", kwargs={"pk": notification.pk})

        self.client.force_authenticate(user=self.user)  

        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Notification.objects.count(), 0)

    from django.core.files.uploadedfile import SimpleUploadedFile

    def test_delete_pdf_valid(self):
        self.user.plan_type = 'free'
        self.user.save()
        self.client.force_authenticate(user=self.user)

        # Creezi un fișier asociat utilizatorului cu conținut valid
        fake_file = SimpleUploadedFile("fake.pdf", b"Fake content", content_type="application/pdf")
        file = File.objects.create(user=self.user, file=fake_file)

        # Generezi URL-ul de ștergere
        url = reverse("file_manager_basic_plan:file_delete", kwargs={"pk": file.pk})

        # Trimiți DELETE
        response = self.client.delete(url)

        # Verifici că răspunsul este 204 No Content
        self.assertEqual(response.status_code, 204)

