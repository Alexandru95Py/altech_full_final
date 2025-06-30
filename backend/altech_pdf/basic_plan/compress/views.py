import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.http import FileResponse

from .serializers import CompressionRequestSerializer
from .utils.compressor import compress_pdf  # Ghostscript-based compressor

class CompressPDFView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = CompressionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = serializer.validated_data["file"]
        compression_level = serializer.validated_data["compression_level"]
        retain_image_quality = serializer.validated_data.get("retain_image_quality", True)
        remove_metadata = serializer.validated_data.get("remove_metadata", False)

        try:
            compressed_file, original_size, compressed_size = compress_pdf(
                uploaded_file=uploaded_file,
                compression_level=compression_level,
                retain_image_quality=retain_image_quality,
                remove_metadata=remove_metadata,
            )

            print(f"⚙️ Compression level: {compression_level}")
            print(f"📂 Original size: {original_size / 1024:.2f} KB")
            print(f"📦 Compressed size: {compressed_size / 1024:.2f} KB")

            is_efficient = compressed_size < original_size * 0.97  # cel puțin 3% reducere

            if not is_efficient:
                print("⚠️ Compresia nu a fost eficientă. Returnăm fișierul original.")

                # Resetăm pointerul fișierului original pentru citire completă
                uploaded_file.seek(0)
                original_stream = io.BytesIO(uploaded_file.read())
                original_stream.seek(0)

                return FileResponse(
                    original_stream,
                    as_attachment=True,
                    filename=uploaded_file.name,
                    content_type="application/pdf",
                    headers={"X-Compression-Status": "inefficient"}
                )

            # 🟢 Returnăm fișierul comprimat
            output_stream = io.BytesIO()
            output_stream.write(compressed_file.read())
            output_stream.seek(0)

            return FileResponse(
                output_stream,
                as_attachment=True,
                filename=f"compressed_{uploaded_file.name}",
                content_type="application/pdf",
                headers={"X-Compression-Status": "success"}
            )

        except Exception as e:
            print(f"❌ Compression failed: {str(e)}")
            return Response(
                {"detail": f"Compression failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )