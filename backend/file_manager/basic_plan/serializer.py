from rest_framework import serializers
from file_manager.models import File

class FileSerializer(serializers.ModelSerializer):
    size = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            'id',
            'user',
            'file',
            'name',
            'extension',
            'size',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'extension', 'size', 'created_at', 'updated_at', 'user']

    def get_size(self, obj):
        if obj.file and hasattr(obj.file, 'size'):
            return obj.file.size
        return 0

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)