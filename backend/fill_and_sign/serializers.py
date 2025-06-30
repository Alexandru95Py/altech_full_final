from rest_framework import serializers


class FillPDFSerializer(serializers.Serializer):
    file = serializers.FileField()
    fields = serializers.DictField(
        child=serializers.CharField(), help_text="Ex: {'Nume': 'Alex', 'Data': '2025-06-04'}"
    )


class SignPDFSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    signature_data = serializers.CharField(required=True, help_text="Base64 encoded signature")

    page = serializers.IntegerField(min_value=0, required=True)
    x = serializers.FloatField(required=True, min_value=0)
    y = serializers.FloatField(required=True, min_value=0)