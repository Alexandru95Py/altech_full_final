import io
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rest_framework.parsers import MultiPartParser, FormParser
from PyPDF2 import PdfReader, PdfWriter
from .serializers import DeletePagesSerializer
import json


class DeletePagesView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # Extragem fișierul
        pdf_file = request.FILES.get("file")
        if not pdf_file:
            return Response({"error": "PDF file is required."}, status=400)

        # Extragem toate valorile pages_to_delete (ex: multiple chei)
        pages_raw = request.POST.getlist("pages_to_delete")
        try:
            pages_to_delete = [int(p) for p in pages_raw if p.isdigit()]
        except ValueError:
            return Response({"error": "Invalid page numbers."}, status=400)

        print("🧾 Pagini de șters:", pages_to_delete)

        # Procesăm fișierul
        reader = PdfReader(pdf_file)
        writer = PdfWriter()

        total_pages = len(reader.pages)
        pages_to_skip = set(page - 1 for page in pages_to_delete if 1 <= page <= total_pages)

        for i in range(total_pages):
            if i not in pages_to_skip:
                writer.add_page(reader.pages[i])

        output_stream = io.BytesIO()
        writer.write(output_stream)
        output_stream.seek(0)

        return FileResponse(
            output_stream,
            as_attachment=True,
            filename="deleted_result.pdf",
            content_type="application/pdf"
        )