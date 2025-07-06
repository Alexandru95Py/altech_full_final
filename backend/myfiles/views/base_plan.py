from rest_framework import generics, permissions
from rest_framework.response import Response
from django.http import FileResponse, Http404
from myfiles.models import PDFFile
from myfiles.serializers.base_plan import PDFFileSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from myfiles.utils.file_validation import validate_pdf_limits
from rest_framework_simplejwt.authentication import JWTAuthentication
import mimetypes

class MyFilesListCreateView(generics.ListCreateAPIView):
    serializer_class = PDFFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return PDFFile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        print("AUTH DEBUG >>>", self.request.user, self.request.auth)
        user = self.request.user
        file = self.request.FILES.get('file')

        # Debugging file upload
        print("DEBUG FILE UPLOAD >>>", file)
        if file:
            print("DEBUG FILE DETAILS >>>", file.name, file.size)

        # Validate limits for the FREE plan
        try:
            validate_pdf_limits(user=user, file=file, plan='free')
        except ValidationError as e:
            print("VALIDATION ERROR >>>", e)
            raise

        try:
            serializer.save(user=user, filename=file.name, size=file.size, file=file)
            print("SAVE SUCCESS >>> File saved successfully.")
        except Exception as e:
            print("SAVE ERROR >>>", e)
            raise

class MyFilesDeleteView(generics.DestroyAPIView):
    queryset = PDFFile.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise Http404("Fișier inexistent.")
        return obj

class MyFilesDownloadView(generics.GenericAPIView):
    queryset = PDFFile.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            pdf = PDFFile.objects.get(pk=pk, user=request.user)
        except PDFFile.DoesNotExist:
            raise Http404("Fișier inexistent.")

        # 🎯 Detectăm tipul MIME din extensia fișierului
        mime_type, _ = mimetypes.guess_type(pdf.filename)
        if not mime_type:
            mime_type = 'application/octet-stream'  # fallback sigur

        print(f"📥 [DEBUG DOWNLOAD] Fișier: {pdf.filename}")
        print(f"🧾 [DEBUG DOWNLOAD] MIME type detectat: {mime_type}")

        response = FileResponse(pdf.file.open('rb'), content_type=mime_type)
        response['Content-Disposition'] = f'attachment; filename="{pdf.filename}"'
        return response