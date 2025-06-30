from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.http import FileResponse, Http404
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import os

from .serializer import FileSerializer
from file_manager.models import File, FileDownloadLog


class FileUploadView(generics.CreateAPIView):
    """
    View pentru încărcarea fișierelor.
    """
    queryset = File.objects.all()
    serializer_class = FileSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]


class FileListView(APIView):
    """
    View pentru listarea fișierelor disponibile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Returnează lista fișierelor utilizatorului autentificat.
        """
        user_files = File.objects.filter(user=request.user)
        files = [{"name": file.name, "size": file.size} for file in user_files]
        return Response({"files": files}, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Metoda POST nu este implementată pentru FileListView.
        """
        return Response(
            {"message": "POST method not implemented for FileListView."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


class FileDeleteView(generics.DestroyAPIView):
    """
    View pentru ștergerea fișierelor.
    """
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Returnează fișierele utilizatorului autentificat.
        """
        return File.objects.filter(user=self.request.user)


class FileDownloadView(APIView):
    """
    View pentru descărcarea fișierelor.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        """
        Permite descărcarea unui fișier dacă utilizatorul are permisiuni.
        """
        user = request.user

        # Verificăm dacă utilizatorul este pe planul FREE
        if user.plan == 'FREE':
            luna_trecuta = timezone.now() - timedelta(days=30)
            numar_downloaduri = FileDownloadLog.objects.filter(
                user=user, downloaded_at__gte=luna_trecuta
            ).count()

            if numar_downloaduri >= 5:
                return Response(
                    {'detail': 'Ai atins limita de 5 descărcări pe lună pentru planul Free.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        try:
            file_instance = File.objects.get(pk=pk, user=user)
        except File.DoesNotExist:
            raise Http404("Fișierul nu a fost găsit.")

        file_path = file_instance.file.path
        if os.path.exists(file_path):
            # Salvăm logul descărcării
            FileDownloadLog.objects.create(user=user, file=file_instance)

            return FileResponse(
                open(file_path, 'rb'),
                as_attachment=True,
                filename=os.path.basename(file_path)
            )
        else:
            raise Http404("Fișierul nu există pe server.")