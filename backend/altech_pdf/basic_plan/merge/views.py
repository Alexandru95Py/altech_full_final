from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse
from PyPDF2.errors import PdfReadError
import os
import uuid
from .utils import merge_pdfs

class MergePDFView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            print("📥 [DEBUG] View-ul folosit: BASIC PLAN")

            files = request.FILES.getlist("files")
            if not files:
                print("❗ [DEBUG] Niciun fișier primit.")
                return Response({"detail": "No files uploaded."}, status=400)

            print(f"✅ [DEBUG] Fișiere primite: {[f.name for f in files]}")

            preserve_bookmarks = request.data.get("preserve_bookmarks") == "true"
            start_new_page = request.data.get("start_new_page") == "true"

            print("🔧 [DEBUG] preserve_bookmarks =", preserve_bookmarks)
            print("🔧 [DEBUG] start_new_page =", start_new_page)

            output_filename = f"merged_{uuid.uuid4().hex}.pdf"
            output_path = os.path.join("media", output_filename)
            os.makedirs("media", exist_ok=True)

            print("🧱 [DEBUG] output_path =", output_path)

            result_path = merge_pdfs(
                files=files,
                output_path=output_path,
                preserve_bookmarks=preserve_bookmarks,
                start_new_page=start_new_page
            )

            print("✅ [DEBUG] Fișier generat cu succes:", result_path)

            return FileResponse(
                open(result_path, "rb"),
                as_attachment=True,
                filename="merged_result.pdf",
                content_type="application/pdf"
            )

        except PdfReadError as e:
            print("❌ [ERROR] PDF read error:", str(e))
            return Response({"detail": f"Merge error (PDF read): {str(e)}"}, status=400)

        except Exception as e:
            print("❌ [ERROR] Merge unexpected exception:", str(e))
            return Response({"detail": f"Merge error: {str(e)}"}, status=500)