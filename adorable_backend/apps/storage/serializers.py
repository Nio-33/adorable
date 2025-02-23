from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import File, SharedFile

User = get_user_model()

class FileSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = ('id', 'user', 'file', 'file_type', 'original_name', 'size', 'mime_type',
                 'title', 'description', 'tags', 'is_public', 'password_protected',
                 'download_count', 'last_accessed', 'created_at', 'updated_at', 'download_url')
        read_only_fields = ('id', 'user', 'size', 'mime_type', 'download_count',
                          'last_accessed', 'created_at', 'updated_at', 'download_url')

    def get_download_url(self, obj):
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.file.url)
        return None

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class SharedFileSerializer(serializers.ModelSerializer):
    file_details = FileSerializer(source='file', read_only=True)
    
    class Meta:
        model = SharedFile
        fields = ('id', 'file', 'file_details', 'shared_by', 'shared_with',
                 'permission', 'can_reshare', 'expires_at', 'created_at', 'updated_at')
        read_only_fields = ('id', 'shared_by', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['shared_by'] = self.context['request'].user
        return super().create(validated_data) 