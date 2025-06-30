


from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.http import FileResponse
from ProtectDocument.utils.doc_encryptor import encrypt_document
import os
import tempfile

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def protect_from_upload(request):
    file = request.FILES.get('file')
    password = request.data.get('password')

    if not file or not password:
        return Response({'error': 'Fișierul și parola sunt obligatorii.'}, status=400)

    try:
        # Salvăm temporar fișierul
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, file.name)
        
        with open(temp_path, 'wb+') as f:
            for chunk in file.chunks():
                f.write(chunk)

        # Detectăm extensia
        file_extension = os.path.splitext(file.name)[1].lower().replace('.', '')  # ex: 'pdf', 'docx', etc.

        # Criptăm fișierul
        encrypted_stream = encrypt_document(temp_path, password, file_type=file_extension)

        # Ștergem fișierul temporar
        os.remove(temp_path)

        # Nume fișier rezultat
        if file_extension == 'pdf':
            output_filename = f"protected_{file.name}"
        else:
            original_name = os.path.splitext(file.name)[0]
            output_filename = f"{original_name}.zip"

        return FileResponse(encrypted_stream, as_attachment=True, filename=output_filename)

    except Exception as e:
        return Response({'error': str(e)}, status=500)