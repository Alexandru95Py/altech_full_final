import json
from rest_framework import serializers
from PyPDF2 import PdfReader


class FillPDFSerializer(serializers.Serializer):
    file = serializers.FileField()
    fields = serializers.DictField(
        child=serializers.CharField(),
        help_text="Exemplu: {'Nume': 'Alex', 'Data': '2025-06-04'}"
    )

    def validate(self, data):
        if not data.get('fields'):
            raise serializers.ValidationError("At least one field must be provided for filling.")
        return data


class SignPDFSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    signature_data = serializers.CharField(
        required=True,
        help_text="Imaginea semnăturii în format Base64 (ex: data:image/png;base64,...)"
    )
    page = serializers.IntegerField(min_value=0, required=True)
    x = serializers.FloatField(required=True, min_value=0)
    y = serializers.FloatField(required=True, min_value=0)

    def validate(self, data):
        file = data.get("file")
        page = data.get("page")

        try:
            reader = PdfReader(file)
            if page >= len(reader.pages):
                raise serializers.ValidationError(f"Page {page} is out of range. PDF has {len(reader.pages)} pages.")
        except Exception:
            raise serializers.ValidationError("Invalid PDF file or unreadable.")

        return data


class DownloadPDFSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    elements = serializers.JSONField(
        required=True,
        help_text="Obiect JSON cu elementele de inserat (text, semnătură, date, etc.)"
    )

    def validate_elements(self, value):
        if not isinstance(value, (dict, list)):
            raise serializers.ValidationError("Elements must be a JSON object or list.")

        # Optional: validăm structura dacă știi exact cum arată fiecare element
        return value

    def validate(self, data):
        try:
            elements = data.get("elements")
            if isinstance(elements, str):
                json.loads(elements)  # doar ca fallback dacă frontend trimite string
        except Exception:
            raise serializers.ValidationError("Invalid JSON format for elements.")
        return data
