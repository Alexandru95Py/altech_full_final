from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import MergePDFSerializer
from django.http import HttpResponseForbidden
from rest_framework.permissions import IsAuthenticated
import os
import uuid
from altech_pdf.pro_plan.merge.utils import merge_pdfs


class MergePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # În etapa actuală, nu verificăm planul Pro
        data = request.data.copy()
        data['files'] = request.FILES.getlist('files')

        serializer = MergePDFSerializer(data=data)
        preserve_bookmarks = request.data.get("preserve_bookmarks") == "true"
        start_new_page = request.data.get("start_new_page") == "true"

        if serializer.is_valid():
            files = serializer.validated_data['files']
            output_filename = f"merged_{uuid.uuid4().hex}.pdf"
            output_path = os.path.join("media", output_filename)
            os.makedirs("media", exist_ok=True)

            result_path = merge_pdfs(
            files=files,
            output_path=output_path,
            preserve_bookmarks=preserve_bookmarks,
            start_new_page=start_new_page
            
        )

            return Response({
                "message": "PDFs merged successfully.",
                "file_path": result_path
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)