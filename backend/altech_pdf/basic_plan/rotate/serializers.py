from rest_framework import serializers


class RotatePDFSerializer(serializers.Serializer):
    file = serializers.FileField()
    pages_to_rotate = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False
    )
    rotation_angle = serializers.ChoiceField(choices=[-90, 90, 180])

    def validate(self, data):
        pages = data.get("pages_to_rotate", [])
        angle = data.get("rotation_angle")

        if not isinstance(pages, list) or not all(isinstance(p, int) for p in pages):
            raise serializers.ValidationError({
                "pages_to_rotate": "All page values must be integers."
            })

        if angle not in [-90, 90, 180]:
            raise serializers.ValidationError({
                "rotation_angle": "Rotation angle must be -90, 90, or 180."
            })

        return data