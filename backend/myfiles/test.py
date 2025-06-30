from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from myfiles.models import PDFFile
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class MyFilesTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="pro@example.com",
            password="test1234"
        )

        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
        self.upload_url = "/api/myfiles/base/upload/"
    
    def get_delete_url(self, file_id):
        return f"/api/myfiles/base/{file_id}/"
    
    def get_download_url(self, file_id):
        return f"/api/myfiles/base/{file_id}/download/"
    

    def create_test_pdf(self, name="test.pdf", size_kb=10):
        content = b"x" * 1024 * size_kb
        return SimpleUploadedFile(name, content, content_type="application/pdf")

    def test_list_is_empty(self):
        response = self.client.get(self.upload_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_upload_pdf_success(self):
        file = self.create_test_pdf()
        response = self.client.post(self.upload_url, {'file': file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PDFFile.objects.count(), 1)

    def test_upload_pdf_limit_reached(self):
        for i in range(20):
            file = self.create_test_pdf(name=f"test{i}.pdf")
            self.client.post(self.upload_url, {'file': file}, format='multipart')
        file = self.create_test_pdf(name="too_much.pdf")
        response = self.client.post(self.upload_url, {'file': file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_pdf_too_large(self):
        large_file = self.create_test_pdf(name="large.pdf", size_kb=6 * 1024)
        response = self.client.post(self.upload_url, {'file': large_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_own_file(self):
        file = self.create_test_pdf(name="file.pdf")
        
        upload_response = self.client.post(self.upload_url, {'file': file}, format='multipart')
        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)

        file_id = upload_response.data.get('id')
        self.assertIsNotNone(file_id)

        delete_response = self.client.delete(self.get_delete_url(file_id))
        print("DELETE STATUS:", delete_response.status_code)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        
    def test_cannot_delete_other_users_file(self):
        other_user = User.objects.create_user(email="other@example.com", password="test1234")
        pdf = PDFFile.objects.create(
            user=other_user,
            filename="otherfile.pdf",
            size=1024,
            file=self.create_test_pdf("otherfile.pdf")
        )
        response = self.client.delete(f"{self.upload_url}{pdf.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_upload_many_pdfs_allowed(self):
        for i in range(20):
            file = self.create_test_pdf(name=f"file{i}.pdf")
            self.client.post(self.upload_url, {'file': file}, format='multipart')
        self.assertEqual(PDFFile.objects.filter(user=self.user).count(), 20)

    def test_upload_oversized_pdf_rejected(self):
        big_file = self.create_test_pdf(name="too_big.pdf", size_kb=55 * 1024)
        response = self.client.post(self.upload_url, {'file': big_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_delete_and_download_work(self):
        file = self.create_test_pdf(name="test.pdf", size_kb=10)

        # PAS 1: Upload fișier
        upload_response = self.client.post(self.upload_url, {'file': file}, format='multipart')
        print("UPLOAD STATUS:", upload_response.status_code)
        print("UPLOAD DATA:", upload_response.data)

        # Verifică status code-ul
        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)

        # Obține ID-ul fișierului
        file_id = upload_response.data.get('id')
        print("FILE ID:", file_id)
        self.assertIsNotNone(file_id, "Fișierul nu a fost creat, ID este None")