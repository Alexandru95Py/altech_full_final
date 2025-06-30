from rest_framework import serializers

class ReorderPDFSerializer(serializers.Serializer):
    file = serializers.FileField()
    new_order = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        allow_empty=False
    )
    reverse = serializers.BooleanField(required=False, default=False)

    def validate(self, data):
        if not data.get('new_order') and not data.get('reverse'):
            raise serializers.ValidationError("Trebuie să specifici fie 'new_order', fie 'reverse=True'.")
        return data
