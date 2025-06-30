from rest_framework import serializers
from PyPDF2 import PdfReader
from django.core.exceptions import ValidationError

class DeletePagesSerializer(serializers.Serializer):
    file = serializers.FileField()
    pages_to_delete = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False
    )

    def validate_file(self, value):
        # Verifică dacă este un PDF real (opțional dar recomandat)
        try:
            PdfReader(value)
        except Exception:
            raise serializers.ValidationError("Fișierul încărcat nu este un PDF valid.")
        return value

    def validate(self, data):
        if not data['pages_to_delete']:
            raise serializers.ValidationError("Lista paginilor de șters nu poate fi goală.")
        return data