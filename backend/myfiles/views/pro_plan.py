from rest_framework import generics, permissions
from rest_framework.response import Response
from django.http import FileResponse, Http404
from myfiles.models import PDFFile
from myfiles.serializers.pro_plan import PDFFileSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from myfiles.utils.file_validation import validate_pdf_limits

class MyFilesListCreateView(generics.ListCreateAPIView):
    serializer_class = PDFFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return PDFFile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        file = self.request.FILES.get('file')

        # Validează limitele pentru planul PRO
        validate_pdf_limits(user=user, file=file, plan='pro')

        serializer.save(user=user, filename=file.name, size=file.size)

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

        response = FileResponse(pdf.file.open('rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{pdf.filename}"'
        return response