import os
import uuid
from functools import wraps
from django.http import JsonResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import ReorderPDFSerializer
from .utils import reorder_pdf
from rest_framework.permissions import IsAuthenticated


from django.http import HttpResponseForbidden

def pro_required(view_func):
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({"error": "Autentificare necesară."}, status=403)
        if getattr(user, 'plan', None) != 'pro':
            return JsonResponse({"error": "Acces permis doar utilizatorilor cu plan Pro."}, status=403)
        return view_func(self, request, *args, **kwargs)
    return wrapper

@pro_required
class ReorderPDFView(APIView):
    permission_classes = [IsAuthenticated]  # Asigură-te că utilizatorul este autentificat
    
    def post(self, request):
        serializer = ReorderPDFSerializer(data=request.data)

        if serializer.is_valid():
            file = serializer.validated_data['file']
            new_order = serializer.validated_data.get('new_order')
            reverse = serializer.validated_data.get('reverse', False)

            output_filename = f"reordered_{uuid.uuid4().hex}.pdf"
            output_path = os.path.join("media", output_filename)

            try:
                result_path = reorder_pdf(file, new_order, reverse, output_path)
                return Response({
                    "message": "PDF pages reordered successfully.",
                    "file_path": result_path
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    "error": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)