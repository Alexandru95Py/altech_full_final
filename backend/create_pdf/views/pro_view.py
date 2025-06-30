import os
import uuid

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.http import HttpResponse
from django.core.files.storage import default_storage

from rest_framework.permissions import IsAuthenticated
from create_pdf.permissions import IsPremiumUser, ALLOW_ALL_ACCESS
from create_pdf.utils.signature_helpers import sign_pdf_file
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO
from django.http import FileResponse
import datetime
from reportlab.lib.utils import ImageReader



from create_pdf.utils.premium_helpers import (
    auto_title_fallback,
    format_invoice_amount,
    normalize_headers,
    stylize_contract_section,
    generate_document_id,
    get_default_terms,
)

from create_pdf.utils.pdf_generator import (
    generate_advanced_table_pdf,
    generate_pdf_with_multiple_images,
    generate_contract_pdf,
    generate_invoice_pdf,
    generate_signed_pdf,
)

from create_pdf.serializers import (
    AdvancedTablePDFSerializer,
    ContractPDFSerializer,
    InvoicePDFSerializer,
    SignPDFSerializer,
)


# === FUNCȚIE COMUNĂ DE RĂSPUNS PDF ===
def serve_pdf(path):
    if not os.path.exists(path):
        return Response({"error": "PDF file not found."}, status=status.HTTP_404_NOT_FOUND)

    with open(path, "rb") as pdf:
        response = HttpResponse(pdf.read(), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{os.path.basename(path)}"'
        return response


# === FUNCȚII PREMIUM ===
class CreateAdvancedTablePDFView(APIView):
    permission_classes = [IsAuthenticated, IsPremiumUser]

    def post(self, request):
        merged_data = request.data.copy()
        merged_data.update(request.FILES)

        serializer = AdvancedTablePDFSerializer(data=merged_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        title = serializer.validated_data["title"]
        headers = serializer.validated_data["headers"]
        rows = serializer.validated_data["rows"]
        styles = serializer.validated_data.get("styles", {})

        pdf_path = generate_advanced_table_pdf(title, headers, rows, styles)
        return serve_pdf(pdf_path)


class CreatePDFWithMultipleImagesView(APIView):
    permission_classes = [IsAuthenticated, IsPremiumUser]

    def post(self, request):
        title = request.data.get("title", "Document cu imagini multiple")
        content = request.data.get("content", "")
        image_files = request.FILES.getlist("images")

        if not image_files:
            return Response({"error": "Trebuie să încarci cel puțin o imagine."}, status=400)

        image_path = default_storage.save(f"temp/{uuid.uuid4()}.img", image_files[0])
        pdf_path = generate_pdf_with_multiple_images(title, content, image_path)
        return serve_pdf(pdf_path)


class ContractPDFView(APIView):
    def post(self, request):
        serializer = ContractPDFSerializer(data=request.data)
        if serializer.is_valid():
            # Extragem datele
            client_name = serializer.validated_data.get("client_name")
            date = serializer.validated_data.get("date")
            service = serializer.validated_data.get("service")
            price = serializer.validated_data.get("price")
            terms = serializer.validated_data.get("terms")

            # Generăm PDF
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            text = p.beginText(50, 800)

            text.textLine("CONTRACT DE SERVICII")
            text.textLine("")
            text.textLine(f"Client: {client_name}")
            text.textLine(f"Data: {date.strftime('%Y-%m-%d')}")
            text.textLine(f"Serviciu: {service}")
            text.textLine(f"Preț: {price} EUR")
            text.textLine(f"Termeni: {terms}")
            text.textLine("")
            text.textLine("Semnătura clientului: ____________________")
            text.textLine("Semnătura prestatorului: _________________")
            text.textLine(f"Data generării: {datetime.date.today()}")

            p.drawText(text)
            p.showPage()
            p.save()
            buffer.seek(0)

            return FileResponse(buffer, as_attachment=True, filename="contract.pdf")

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateInvoicePDFView(APIView):
    permission_classes = [IsAuthenticated, IsPremiumUser]

    def post(self, request):
        serializer = InvoicePDFSerializer(data=request.data)
        if serializer.is_valid():
            pdf_path = generate_invoice_pdf(serializer.validated_data)
            return serve_pdf(pdf_path)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FillAndSignPDFView(APIView):
    permission_classes = [IsAuthenticated, IsPremiumUser]

    def post(self, request):
        data = request.data.copy()
        data.update(request.FILES)

        serializer = SignPDFSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        pdf_file = serializer.validated_data["pdf"]
        signature = serializer.validated_data["signature"]
        position = serializer.validated_data.get("position", {"x": 100, "y": 100})

        pdf_path = sign_pdf_file(pdf_file, signature, position)
        return serve_pdf(pdf_path)