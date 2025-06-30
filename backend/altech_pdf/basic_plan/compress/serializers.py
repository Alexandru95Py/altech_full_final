from rest_framework import serializers

class CompressionRequestSerializer(serializers.Serializer):
    file = serializers.FileField()
    compression_level = serializers.ChoiceField(
        choices=["low", "medium", "high"],
        default="medium",
        help_text="Compression level: low (20%), medium (35%), high (50%)"
    )
    retain_image_quality = serializers.BooleanField(
        required=False,
        default=True,
        help_text="Retain image quality (slower compression)"
    )
    remove_metadata = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Remove PDF metadata for privacy"
    )
    replace_original = serializers.BooleanField(
        required=False,
        default=False,
        help_text="If true, replaces file in 'My Files'"
    )

    def validate_file(self, value):
        if not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Only PDF files are allowed.")
        return value