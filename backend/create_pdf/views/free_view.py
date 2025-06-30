from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from django.core.files.storage import default_storage
from rest_framework.permissions import IsAuthenticated

from create_pdf.utils.pdf_generator import (
    generate_basic_pdf,
    generate_pdf_with_image,
    generate_pdf_with_table
)
from create_pdf.serializers import (
    BasicPDFSerializer,
    ImagePDFSerializer,
    TablePDFSerializer
)

def serve_pdf(path):
    with open(path, "rb") as pdf:
        response = HttpResponse(pdf.read(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="creatie.pdf"'
        return response

class CreateBasicPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BasicPDFSerializer(data=request.data)
        if serializer.is_valid():
            title = serializer.validated_data["title"]
            content = serializer.validated_data["content"]
            pdf_path = generate_basic_pdf(title, content)
            return serve_pdf(pdf_path)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreatePDFWithImageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ImagePDFSerializer(data=request.data)
        if serializer.is_valid():
            title = serializer.validated_data["title"]
            content = serializer.validated_data["content"]
            image = serializer.validated_data["image"]
            image_path = default_storage.save(f"temp/{image.name}", image)
            pdf_path = generate_pdf_with_image(title, content, image_path)
            return serve_pdf(pdf_path)
        else:
            print("VALIDATION ERRORS:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreatePDFWithTableView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TablePDFSerializer(data=request.data)
        if serializer.is_valid():
            title = serializer.validated_data["title"]
            headers = serializer.validated_data["headers"]
            rows = serializer.validated_data["rows"]
            pdf_path = generate_pdf_with_table(title, headers, rows)
            return serve_pdf(pdf_path)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)