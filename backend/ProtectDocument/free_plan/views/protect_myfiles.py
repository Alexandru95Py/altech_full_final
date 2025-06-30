from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import FileResponse
from file_manager.models import File
from ProtectDocument.utils.doc_encryptor import encrypt_document
import os


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def protect_from_myfiles(request):
    file_id = request.data.get('file_id')
    password = request.data.get('password')

    if not file_id or not password:
        return Response({'error': 'ID și parola lipsă.'}, status=400)

    try:
        file_instance = File.objects.get(id=file_id, user=request.user)
    except File.DoesNotExist:
        return Response({'error': 'Fișierul nu există sau nu îți aparține.'}, status=404)

    try:
        file_path = file_instance.file.path
        file_extension = os.path.splitext(file_path)[1].lower().replace('.', '')  # ex: 'pdf', 'docx'

        file_path = file_instance.file.path
        file_extension = os.path.splitext(file_path)[1].lower().replace('.', '')  # ex: 'pdf', 'docx'

        print("DEBUG file path:", file_path)
        print("DEBUG file extension:", file_extension)


        output_stream = encrypt_document(file_path, password, file_type=file_extension)

        # Setăm numele fișierului criptat în funcție de tip
        if file_extension == 'pdf':
            output_filename = "protected_document.pdf"
        else:
            original_name = os.path.splitext(os.path.basename(file_path))[0]
            output_filename = f"{original_name}.zip"

        return FileResponse(output_stream, as_attachment=True, filename=output_filename)

    except Exception as e:
        return Response({'error': str(e)}, status=500)