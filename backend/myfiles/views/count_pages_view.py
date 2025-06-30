from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from myfiles.utils.count_pages import get_pdf_page_count

class CountPagesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        page_count = get_pdf_page_count(file)
        return Response({"pages": page_count}, status=status.HTTP_200_OK)
