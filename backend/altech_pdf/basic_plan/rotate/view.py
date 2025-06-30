from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse
from .serializers import RotatePDFSerializer
from .utils.rotate_pdf import rotate_pdf
import io
import json


class RotatePDFView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        print("🟢 [ROTATE VIEW] POST received")
        print("🟢 RAW DATA:", request.data)

        try:
            file = request.FILES.get("file")
            pages_raw = request.data.get("pages_to_rotate")
            angle_raw = request.data.get("rotation_angle")

            # 🔍 Procesăm pages_to_rotate și rotation_angle
            pages = json.loads(pages_raw) if isinstance(pages_raw, str) else pages_raw
            pages = [int(p) for p in pages]  # asigurăm că sunt int
            angle = int(angle_raw)

            print("✅ Parsed pages_to_rotate:", pages)
            print("✅ Parsed rotation_angle:", angle)
        except Exception as e:
            print("❌ Error parsing input data:", str(e))
            return Response({"error": "Invalid input format"}, status=400)

        # ✅ Trimitem datele curate în serializer
        serializer = RotatePDFSerializer(data={
            "file": file,
            "pages_to_rotate": pages,
            "rotation_angle": angle
        })

        if not serializer.is_valid():
            print("❌ Serializer invalid:", serializer.errors)
            return Response(serializer.errors, status=400)

        validated_data = serializer.validated_data

        try:
            writer = rotate_pdf(
                validated_data["file"],
                validated_data["pages_to_rotate"],
                validated_data["rotation_angle"]
            )
            output = io.BytesIO()
            writer.write(output)
            output.seek(0)

            print("✅ PDF rotation complete, returning file.")
            return FileResponse(
                output,
                as_attachment=True,
                filename="rotated_result.pdf",
                content_type="application/pdf"
            )
        except Exception as e:
            print("❌ Exception during PDF rotation:", str(e))
            return Response({"error": str(e)}, status=500)