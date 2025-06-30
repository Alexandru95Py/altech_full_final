import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.http import FileResponse

from .serializers import ConvertRequestSerializer
from .utils import convert_pdf_to_format


class ConvertPDFView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        print("📥 [DEBUG] Cerere de conversie primită.")

        serializer = ConvertRequestSerializer(data=request.data)
        if not serializer.is_valid():
            print("❌ [DEBUG] Serializer invalid:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = serializer.validated_data["file"]
        target_format = serializer.validated_data["target_format"]

        print(f"📂 [DEBUG] Fișier primit: {uploaded_file.name}, format țintă: {target_format}")

        try:
            converted_file, output_filename, content_type = convert_pdf_to_format(
                uploaded_file, target_format
            )

            print(f"✅ [DEBUG] Conversie reușită: {output_filename}, tip: {content_type}")

            output_stream = io.BytesIO(converted_file.read())
            output_stream.seek(0)

            return FileResponse(
                output_stream,
                as_attachment=True,
                filename=output_filename,
                content_type=content_type,
            )

        except Exception as e:
            print("❌ [ERROR] Conversia a eșuat:", str(e))
            return Response(
                {"detail": f"Conversion failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )