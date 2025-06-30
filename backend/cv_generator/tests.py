from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from support.authentificated_test_case import AuthenticatedAPITestCase

class CVGenerationTest(AuthenticatedAPITestCase):
    def setUp(self):
        super().setUp()
        self.url = reverse("cv_generator:generate_cv")  # ajustează dacă ai alt nume în urls.py

        self.cv_data = {
            "full_name": "Alex G.",
            "about": "Programator pasionat de inovație și eficiență.",
            "education": "Facultatea de Informatică, Cluj-Napoca",
            "experience": "5 ani ca Freelancer, 1 an la Google",
            "skills": "Python, React, Django, REST APIs",
            "languages": "Română, Engleză, Germană",
            "links": "https://github.com/AlexG"
        }

    def test_generate_cv_without_photo(self):
        response = self.client.post(self.url, data=self.cv_data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertTrue(len(response.content) > 1000)  # Confirmă că PDF-ul nu e gol

    def test_generate_cv_with_photo(self):
        with open('test_files/sample_photo.jpg', 'rb') as photo:
            data_with_photo = self.cv_data.copy()
            data_with_photo["photo"] = photo
            response = self.client.post(self.url, data=data_with_photo, format='multipart')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response["Content-Type"], "application/pdf")
            self.assertTrue(len(response.content) > 1000)

    def test_generate_cv_missing_required_field(self):
        bad_data = self.cv_data.copy()
        bad_data.pop("full_name")  # eliminăm un câmp obligatoriu
        response = self.client.post(self.url, data=bad_data)
        self.assertEqual(response.status_code, 400)
        if "application/json" in response["Content-Type"]:
            self.assertIn("full_name", response.json())
        else:
            print("Averisment! raspunsul nu este JSON", response["Content-Type"])