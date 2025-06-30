from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from file_manager.models import File

User = get_user_model()


class FileManagerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='secure123')
        self.client.force_authenticate(user=self.user)

    def test_upload_file(self):
        url = reverse('file_manager_basic_plan:file_upload')
        file = SimpleUploadedFile("test.txt", b"Hello world!", content_type="text/plain")
        data = {
            "file": file,
            "name": "test.txt"
        }

        response = self.client.post(url, data, format='multipart')

        print("RESPONSE DATA:", response.data)  # Debugging line

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(File.objects.filter(user=self.user).exists())

    def test_list_files(self):
        self.user.plan_type = 'free'
        self.user.save()
        self.client.force_authenticate(user=self.user)

        File.objects.create(
            user=self.user,
            file=SimpleUploadedFile("doc.txt", b"1234"),
            name="doc.txt"
        )

        url = reverse('file_manager_basic_plan:file_list')
        response = self.client.get(url)

        print("RESPONSE DATA:", response.data)  # Debug temporar

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["files"]), 1)
        self.assertEqual(response.data["files"][0]["name"], "doc.txt")

    def test_download_file(self):
        uploaded_file = File.objects.create(
            user=self.user,
            file=SimpleUploadedFile("download.txt", b"Download this")
        )
        url = reverse('file_manager_basic_plan:file_download', kwargs={'pk': uploaded_file.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = b"".join(response.streaming_content)
        self.assertEqual(content, b"Download this")

    def test_delete_file(self):
        file_instance = File.objects.create(
            user=self.user,
            file=SimpleUploadedFile("delete_me.txt", b"To be deleted")
        )
        url = reverse('file_manager_basic_plan:file_delete', kwargs={'pk': file_instance.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(File.objects.filter(pk=file_instance.pk).exists())

    def test_file_extension_generated(self):
        self.client.force_authenticate(user=self.user)
        file = SimpleUploadedFile("sample.pdf", b"dummy content", content_type="application/pdf")
        response = self.client.post(reverse("file_manager_basic_plan:file_upload"), {"file": file}, format="multipart")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(File.objects.first().extension, "pdf")