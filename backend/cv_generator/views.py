from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.http import HttpResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
import tempfile
import os

from .serializers import CVDataSerializer
from .pdf_generator import generate_cv_pdf
from rest_framework.permissions import IsAuthenticated


class GenerateCVView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_clases = [IsAuthenticated]  # Asigură-te că utilizatorul este autentificat
    authentication_classes = [JWTAuthentication]  # Asigură-te că ai JWTAuthentication configurat

    def post(self, request):
        # 🛠 DEBUG INPUT
        print("📦 Received request data:", dict(request.data))
        print("📷 Received files:", dict(request.FILES))

        serializer = CVDataSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            photo = request.FILES.get('profile_photo')

            # Salvează poza temporar
            photo_url = None
            if photo:
                try:
                    photo_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
                    photo_path = photo_temp.name
                    with open(photo_path, 'wb+') as destination:
                        for chunk in photo.chunks():
                            destination.write(chunk)
                    photo_url = photo_path
                    print("✅ Poza salvată la:", photo_url)
                    print("📁 Existență fișier:", os.path.exists(photo_url))
                    print("📏 Dimensiune fișier:", os.path.getsize(photo_url) if os.path.exists(photo_url) else "NU EXISTĂ")
                except Exception as e:
                    print("❌ Eroare la salvarea pozei:", e)

            # Generează PDF
            try:
                pdf_path = generate_cv_pdf(data, photo_url)
                print("✅ PDF generat la:", pdf_path)
            except Exception as e:
                print("❌ Eroare la generarea PDF-ului:", e)
                return Response({"error": "Eroare internă la generarea PDF-ului."}, status=500)

            # Returnează PDF ca răspuns
            try:
                with open(pdf_path, 'rb') as pdf_file:
                    response = HttpResponse(pdf_file.read(), content_type='application/pdf')
                    response['Content-Disposition'] = 'attachment; filename="cv.pdf"'
                    return response
            except Exception as e:
                print("❌ Eroare la trimiterea fișierului PDF:", e)
                return Response({"error": "Eroare la citirea PDF-ului generat."}, status=500)

        # 🛠 DEBUG SERIALIZER
        print("❌ Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
