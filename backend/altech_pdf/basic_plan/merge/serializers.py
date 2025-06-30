from rest_framework import serializers

class MergePDFSerializer(serializers.Serializer):
    files = serializers.ListField(
        child=serializers.FileField(),
        min_length=2,
        allow_empty=False
    )
