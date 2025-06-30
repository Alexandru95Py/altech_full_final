from rest_framework import serializers
from myfiles.models import PDFFile

class PDFFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFFile
        fields = ['id', 'filename', 'size', 'uploaded_at', 'file']
        read_only_fields = ['id', 'filename', 'size', 'uploaded_at']