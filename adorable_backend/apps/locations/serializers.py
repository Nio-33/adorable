from rest_framework import serializers
from .models import Place, PlacePhoto, PlaceReview, UserLocation, SavedPlace
from adorable_backend.apps.users.serializers import UserSerializer

class PlacePhotoSerializer(serializers.ModelSerializer):
    """Serializer for PlacePhoto model"""
    class Meta:
        model = PlacePhoto
        fields = ('id', 'place', 'photo', 'caption', 'uploaded_by', 'uploaded_at')
        read_only_fields = ('uploaded_by', 'uploaded_at')

class PlaceReviewSerializer(serializers.ModelSerializer):
    """Serializer for PlaceReview model"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = PlaceReview
        fields = ('id', 'place', 'user', 'rating', 'review',
                 'created_at', 'updated_at')
        read_only_fields = ('user', 'created_at', 'updated_at')

class PlaceSerializer(serializers.ModelSerializer):
    """Serializer for Place model"""
    photos = PlacePhotoSerializer(many=True, read_only=True)
    reviews = PlaceReviewSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    average_rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Place
        fields = ('id', 'name', 'description', 'address', 'latitude',
                 'longitude', 'category', 'tags', 'rating', 'total_ratings',
                 'created_by', 'created_at', 'updated_at', 'photos',
                 'reviews', 'average_rating')
        read_only_fields = ('created_by', 'created_at', 'updated_at',
                          'rating', 'total_ratings')

class UserLocationSerializer(serializers.ModelSerializer):
    """Serializer for UserLocation model"""
    class Meta:
        model = UserLocation
        fields = ('id', 'latitude', 'longitude', 'timestamp', 'is_sharing')
        read_only_fields = ('timestamp',)

class SavedPlaceSerializer(serializers.ModelSerializer):
    """Serializer for SavedPlace model"""
    place = PlaceSerializer(read_only=True)
    place_id = serializers.PrimaryKeyRelatedField(
        queryset=Place.objects.all(),
        write_only=True,
        source='place'
    )

    class Meta:
        model = SavedPlace
        fields = ('id', 'place', 'place_id', 'saved_at', 'notes')
        read_only_fields = ('saved_at',) 