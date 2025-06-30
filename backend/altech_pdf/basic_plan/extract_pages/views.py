import io
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from PyPDF2 import PdfReader, PdfWriter


class ExtractPagesView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # necesar pentru form-data cu fișier

    def post(self, request):
        pdf_file = request.FILES.get("file")
        page_list = request.data.getlist("pages")

        if not pdf_file:
            return Response({"error": "No PDF file uploaded."}, status=400)

        if not page_list:
            return Response({"error": "No pages provided."}, status=400)

        try:
            # Convertim paginile în indici zero-based
            pages = [int(p) - 1 for p in page_list if int(p) > 0]
        except ValueError:
            return Response({"error": "Invalid page numbers."}, status=400)

        try:
            reader = PdfReader(pdf_file)
            writer = PdfWriter()

            for index in pages:
                if 0 <= index < len(reader.pages):
                    writer.add_page(reader.pages[index])

            output = io.BytesIO()
            writer.write(output)
            output.seek(0)

            return FileResponse(
                output,
                as_attachment=True,
                filename="extracted_pages.pdf",
                content_type="application/pdf"
            )
        except Exception as e:
            return Response(
                {"error": f"PDF extraction failed: {str(e)}"},
                status=500
            )
