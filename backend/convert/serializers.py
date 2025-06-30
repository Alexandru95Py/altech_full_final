from rest_framework import serializers


class ConvertRequestSerializer(serializers.Serializer):
    file = serializers.FileField()
    target_format = serializers.ChoiceField(
        choices=["docx", "pptx", "jpg", "png", "txt"],
        help_text="Choose the desired output format",
    )

    def validate_file(self, value):
        if not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Only PDF files are allowed.")
        return value