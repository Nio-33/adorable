from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import F, Q
from .models import File, SharedFile
from .serializers import FileSerializer, SharedFileSerializer

class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['file_type', 'is_public']
    search_fields = ['title', 'description', 'original_name', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'size', 'download_count']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        # Show user's own files and files shared with them
        return File.objects.filter(
            Q(user=user) |
            Q(shares__shared_with=user)
        ).distinct()

    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        file = self.get_object()
        file.download_count = F('download_count') + 1
        file.last_accessed = timezone.now()
        file.save()
        
        serializer = self.get_serializer(file)
        return Response(serializer.data)

class SharedFileViewSet(viewsets.ModelViewSet):
    serializer_class = SharedFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['permission']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        return SharedFile.objects.filter(
            Q(shared_by=user) |
            Q(shared_with=user)
        ).select_related('file')
 