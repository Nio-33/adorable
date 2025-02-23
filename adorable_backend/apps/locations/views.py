from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .models import Location
from .serializers import LocationSerializer

class LocationFilter(filters.FilterSet):
    class Meta:
        model = Location
        fields = {
            'type': ['exact'],
            'is_primary': ['exact'],
            'name': ['icontains'],
            'address': ['icontains'],
        }

class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = LocationFilter
    search_fields = ['name', 'address']
    ordering_fields = ['name', 'created_at', 'type']
    ordering = ['-is_primary', '-created_at']

    def get_queryset(self):
        return Location.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def primary(self, request):
        location = self.get_queryset().filter(is_primary=True).first()
        if location:
            serializer = self.get_serializer(location)
            return Response(serializer.data)
        return Response({'detail': 'No primary location set'}, status=404) 