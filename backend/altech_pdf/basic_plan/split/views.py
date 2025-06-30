import os
import io
from PyPDF2 import PdfReader, PdfWriter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse
from django.conf import settings

class SplitPDFView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        pdf_file = request.FILES.get("file")
        split_method = request.data.get("split_method")
        split_every = request.data.get("split_every")
        pages_to_split = request.data.get("pages_to_split")

        if not pdf_file:
            return Response({"detail": "Missing file."}, status=400)

        try:
            reader = PdfReader(pdf_file)

            # ➤ Handle EVENLY split
            if split_method == "evenly" and split_every:
                try:
                    interval = int(split_every)
                    if interval <= 0:
                        raise ValueError("Invalid interval.")
                except Exception:
                    return Response({"detail": "Invalid split_every value."}, status=400)

                writer = PdfWriter()
                for i in range(min(interval, len(reader.pages))):
                    writer.add_page(reader.pages[i])

                output = io.BytesIO()
                writer.write(output)
                output.seek(0)

                return FileResponse(
                    output,
                    as_attachment=True,
                    filename="split_result.pdf",
                    content_type="application/pdf",
                )

            # ➤ Handle SELECTION or RANGE
            if not pages_to_split:
                return Response({"detail": "Missing pages_to_split."}, status=400)

            try:
                pages = [int(p) - 1 for p in eval(pages_to_split)]
            except Exception:
                return Response({"detail": "Invalid page selection."}, status=400)

            writer = PdfWriter()
            for page_num in pages:
                if 0 <= page_num < len(reader.pages):
                    writer.add_page(reader.pages[page_num])

            output_stream = io.BytesIO()
            writer.write(output_stream)
            output_stream.seek(0)

            return FileResponse(
                output_stream,
                as_attachment=True,
                filename="split_result.pdf",
                content_type="application/pdf",
            )

        except Exception as e:
            return Response({"detail": f"Split error: {str(e)}"}, status=500)