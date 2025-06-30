from rest_framework import serializers

class DeletePagesSerializer(serializers.Serializer):
    file = serializers.FileField()
    pages_to_delete = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False
    )

    def validate(self, data):
        if not data['pages_to_delete']:
            raise serializers.ValidationError("Lista paginilor de șters nu poate fi goală.")
        return data
