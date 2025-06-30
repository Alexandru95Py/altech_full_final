import logging
import json
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse
from .utils import reorder_pdf

logger = logging.getLogger(__name__)

class ReorderPDFView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        pdf_file = request.FILES.get("file")
        new_order_data = request.data.get("new_order")

        if not pdf_file or not new_order_data:
            return Response({"detail": "Missing file or new_order."}, status=400)

        try:
            new_order = json.loads(new_order_data)
            if not isinstance(new_order, list) or not all(isinstance(i, int) for i in new_order):
                raise ValueError("Invalid page order format.")
        except Exception as e:
            return Response({"detail": f"Invalid order data: {str(e)}"}, status=400)

        try:
            output_stream = reorder_pdf(pdf_file, new_order)
            return FileResponse(
                output_stream,
                as_attachment=True,
                filename="reordered_result.pdf",
                content_type="application/pdf"
            )
        except Exception as e:
            logger.error(f"Reorder error: {str(e)}")
            return Response({"detail": f"Reorder error: {str(e)}"}, status=500)