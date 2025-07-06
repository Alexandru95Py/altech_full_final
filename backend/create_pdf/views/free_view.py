from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
import os
from django.core.files.storage import default_storage
from django.conf import settings
import uuid
from create_pdf.utils.clean_and_render_content import clean_and_render_content
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from create_pdf.serializers import (
    BasicPDFSerializer,
    ImagePDFSerializer,
    TablePDFSerializer,
    AdvancedTablePDFSerializer,
    InvoicePDFSerializer,
    ContractPDFSerializer
)
from django.http import FileResponse, HttpResponse
from rest_framework.permissions import IsAuthenticated

# ========== GENERATOR FUNCTIONS ========== (Free only)

def generate_basic_pdf(title, content):
    tmp_dir = os.path.join(os.getcwd(), "tmp")
    os.makedirs(tmp_dir, exist_ok=True)
    path = os.path.join(tmp_dir, f"{title.replace(' ', '_')}.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4
    y = height - 80  # Start a bit lower, but don't draw title again
    # Ensure clean_and_render_content handles all alignment and style from HTML
    y = clean_and_render_content(content, c, y)
    c.save()
    return path

def generate_pdf_with_image(title, content, image):
    output_dir = os.path.join(settings.BASE_DIR, 'media', 'temp')
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}_{title.replace(' ', '_')}_img.pdf"
    path = os.path.join(output_dir, filename)
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4
    y = height - 80  # Start a bit lower, but don't draw title again
    # Ensure clean_and_render_content handles all alignment and style from HTML
    y = clean_and_render_content(content, c, y)
    try:
        image_path = default_storage.save(f"temp/{image.name}", image)
        full_image_path = os.path.join(settings.MEDIA_ROOT, image_path)
        c.drawImage(ImageReader(full_image_path), 100, y - 150, width=300, preserveAspectRatio=True, mask='auto')
    except Exception as e:
        c.drawString(100, y - 160, f"Eroare la imagine: {e}")
    c.save()
    return path

def generate_pdf_with_table(title, headers, rows):
    tmp_dir = os.path.join(os.getcwd(), "tmp")
    os.makedirs(tmp_dir, exist_ok=True)
    path = os.path.join(tmp_dir, f"{title.replace(' ', '_')}_table.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 80, title)
    data = [headers] + rows
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.gray),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ])
    table = Table(data, repeatRows=1, colWidths=[1.5 * inch] * len(headers))
    table.setStyle(style)
    table.wrapOn(c, width, height)
    table.drawOn(c, 100, height - 300)
    c.save()
    return path

# ========== VIEW HELPERS ==========

def serve_pdf(path):
    with open(path, "rb") as pdf:
        response = HttpResponse(pdf.read(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="creatie.pdf"'
        return response

# ========== BASIC VIEWS ========== (INCLUDE ALL FUNCTIONS IN FREE)

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
            pdf_path = generate_pdf_with_image(title, content, image)
            return serve_pdf(pdf_path)
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
