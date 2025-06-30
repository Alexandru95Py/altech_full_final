import os
import uuid

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import DeletePagesSerializer
from .utils import delete_pages_from_pdf
from rest_framework.permissions import IsAuthenticated


class DeletePagesView(APIView):
    permission_classes = [IsAuthenticated] 
     # Asigură-te că utilizatorul este autentificat
    def post(self, request):
        serializer = DeletePagesSerializer(data=request.data)

        if serializer.is_valid():
            file = serializer.validated_data['file']
            pages_to_delete = serializer.validated_data['pages_to_delete']

            output_filename = f"deleted_{uuid.uuid4().hex}.pdf"
            output_path = os.path.join("media", output_filename)

            result_path = delete_pages_from_pdf(file, pages_to_delete, output_path)

            return Response({
                "message": "Pages deleted successfully.",
                "file_path": result_path
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
