from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Place, PlacePhoto, PlaceReview, UserLocation, SavedPlace
from .serializers import (
    PlaceSerializer, PlacePhotoSerializer, PlaceReviewSerializer,
    UserLocationSerializer, SavedPlaceSerializer
)

class PlaceViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing places"""
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description', 'address']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def save_place(self, request, pk=None):
        """Save a place for the current user"""
        place = self.get_object()
        saved_place, created = SavedPlace.objects.get_or_create(
            user=request.user,
            place=place
        )
        return Response({'status': 'place saved'})

class PlacePhotoViewSet(viewsets.ModelViewSet):
    """ViewSet for place photos"""
    queryset = PlacePhoto.objects.all()
    serializer_class = PlacePhotoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class PlaceReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for place reviews"""
    queryset = PlaceReview.objects.all()
    serializer_class = PlaceReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserLocationViewSet(viewsets.ModelViewSet):
    """ViewSet for user locations"""
    serializer_class = UserLocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserLocation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SavedPlaceViewSet(viewsets.ModelViewSet):
    """ViewSet for saved places"""
    serializer_class = SavedPlaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedPlace.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user) 