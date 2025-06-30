from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.http import FileResponse
from ProtectDocument.utils.doc_encryptor import encrypt_document

import os

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def protect_advanced(request):
    file = request.FILES.get('file')
    password = request.data.get('password')

    if not file or not password:
        return Response({'error': 'Fișierul și parola sunt obligatorii.'}, status=400)

    try:
        # Salvăm temporar fișierul
        temp_path = f'/tmp/{file.name}'
        with open(temp_path, 'wb+') as f:
            for chunk in file.chunks():
                f.write(chunk)

        file_extension = os.path.splitext(file.name)[1].lower().replace('.', '')

        # Criptare document
        encrypted_stream = encrypt_document(temp_path, password, file_type=file_extension)

        # Returnăm fișierul criptat
        return FileResponse(encrypted_stream, as_attachment=True, filename=f'protected_advanced.{file_extension}')

    except NotImplementedError:
        return Response({'error': f'Criptarea pentru .{file_extension} nu este încă implementată.'}, status=501)

    except Exception as e:
        return Response({'error': str(e)}, status=500)