from rest_framework import serializers

class SplitPDFSerializer(serializers.Serializer):
    file = serializers.FileField()
    start_page = serializers.IntegerField(min_value=1)
    end_page = serializers.IntegerField(min_value=1)

    def validate(self, data):
        if data['start_page'] > data['end_page']:
            raise serializers.ValidationError("Start page cannot be greater than end page.")
        return data
