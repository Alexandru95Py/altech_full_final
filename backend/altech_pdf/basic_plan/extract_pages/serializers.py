from rest_framework import serializers

class ExtractPagesSerializer(serializers.Serializer):
    pages = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False
    )

    def validate_pages(self, value):
        if not isinstance(value, list) or not all(isinstance(v, int) and v > 0 for v in value):
            raise serializers.ValidationError("Pages must be a list of positive integers.")
        return value
