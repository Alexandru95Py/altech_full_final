from rest_framework import serializers
from file_manager.models import File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = [
            'id',
            'user',
            'file',
            'name',
            'extension',
            'size',
            'uploaded_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'extension', 'size', 'uploaded_at', 'updated_at', 'user']

    def create(self, validated_data):
        # Adaugă automat user-ul autentificat
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
