from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse
from django.core.files.uploadedfile import SimpleUploadedFile

from create_pdf.serializers import SignPDFSerializer
from fill_and_sign.models import save_fill_or_sign_action
from fill_and_sign.serializers import FillPDFSerializer, DownloadPDFSerializer

from .decorators import free_or_pro_required
from .utils.sign_helper import apply_elements_to_pdf, fill_pdf_fields, sign_pdf_with_image

import json
import os
import io
import traceback


class FillPDFView(APIView):
    permission_classes = [IsAuthenticated]

    @free_or_pro_required
    def post(self, request):
        print(">> [FillPDFView] Request received")
        serializer = FillPDFSerializer(data=request.data)

        if serializer.is_valid():
            filled_path = fill_pdf_fields(
                serializer.validated_data["file"],
                serializer.validated_data["fields"]
            )
            print(f">> [FillPDFView] PDF completat: {filled_path}")

            try:
                with open(filled_path, "rb") as f:
                    pdf_bytes = f.read()

                # Save in My Files removed to prevent double save. Only DownloadFilledPDFView handles saving now.

                return FileResponse(
                    io.BytesIO(pdf_bytes),
                    as_attachment=True,
                    filename="filled_document.pdf",
                    content_type="application/pdf"
                )
            except Exception as e:
                print(f"[ERROR] Eroare la citirea sau salvarea fișierului completat: {e}")
                traceback.print_exc()
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        print(">> [FillPDFView] Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SignPDFView(APIView):
    permission_classes = [IsAuthenticated]

    @free_or_pro_required
    def post(self, request):
        serializer = SignPDFSerializer(data=request.data)

        if serializer.is_valid():
            signed_path = sign_pdf_with_image(
                serializer.validated_data["file"],
                serializer.validated_data["signature_image"],
                serializer.validated_data["page"],
                serializer.validated_data["x"],
                serializer.validated_data["y"]
            )
            print(f">> [SignPDFView] PDF semnat: {signed_path}")

            try:
                with open(signed_path, "rb") as f:
                    pdf_bytes = f.read()

                # Save in My Files removed to prevent double save. Only DownloadFilledPDFView handles saving now.

                return FileResponse(
                    io.BytesIO(pdf_bytes),
                    as_attachment=True,
                    filename="signed_document.pdf",
                    content_type="application/pdf"
                )
            except Exception as e:
                print(f"[ERROR] Eroare la citirea sau salvarea fișierului semnat: {e}")
                traceback.print_exc()
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DownloadFilledPDFView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @free_or_pro_required
    def post(self, request):
        print(">>> [DEBUG] DownloadFilledPDFView - început")
        
        serializer = DownloadPDFSerializer(data=request.data)

        if not serializer.is_valid():
            print(f"[DEBUG] Serializer invalid: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        pdf_file = serializer.validated_data["file"]
        elements_json = serializer.validated_data["elements"]

        # DEBUG - Mode primit
        mode = request.POST.get("mode", "download").strip().lower()
        print(f"[DEBUG] Mode primit: {mode}")

        # DEBUG - Elemente parse
        try:
            elements = json.loads(elements_json) if isinstance(elements_json, str) else elements_json
            print(f"[DEBUG] Elements parsed: {elements}")
        except Exception as e:
            print(f"[ERROR] JSON parsing failed: {e}")
            traceback.print_exc()
            return Response({"error": f"Invalid elements JSON: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        # DEBUG - Aplica modificări
        try:
            modified_file = apply_elements_to_pdf(pdf_file, json.dumps(elements))
            print(f"[DEBUG] PDF modificat (SimpleUploadedFile): {modified_file.name}")
        except Exception as e:
            print(f"[ERROR] Failed to apply elements: {e}")
            traceback.print_exc()
            return Response({"error": f"Failed to apply elements: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # DEBUG - Procesare finală
        try:
            pdf_bytes = modified_file.read()
            modified_file.seek(0)

            if mode == "save":
                print("[DEBUG] Mod = save => salvare în My Files")
                result_file = SimpleUploadedFile(
                    name=modified_file.name,
                    content=pdf_bytes,
                    content_type="application/pdf"
                )
                save_fill_or_sign_action(
                    user=request.user,
                    action_type="fill",
                    original_file=pdf_file,
                    result_file=result_file,
                    page=None,
                    x=None,
                    y=None,
                    details={"elements": elements}
                )
                print("[DEBUG] PDF salvat cu succes în My Files")

            return FileResponse(
                io.BytesIO(pdf_bytes),
                as_attachment=True,
                filename="filled_elements.pdf",
                content_type="application/pdf"
            )
        except Exception as e:
            print(f"[ERROR] Final file response failed: {e}")
            traceback.print_exc()
            return Response({"error": f"Final file response failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
