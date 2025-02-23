from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext_lazy as _
from users.models import User

class Place(models.Model):
    """Model for storing place information"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    category = models.CharField(max_length=50)
    tags = ArrayField(models.CharField(max_length=50), blank=True, default=list)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_ratings = models.IntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'places'
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return self.name

class PlacePhoto(models.Model):
    """Model for storing place photos"""
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='place_photos/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'place_photos'

class PlaceReview(models.Model):
    """Model for storing place reviews"""
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField()
    review = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'place_reviews'
        unique_together = ['place', 'user']

class UserLocation(models.Model):
    """Model for tracking user locations"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_sharing = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_locations'
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['latitude', 'longitude']),
        ]

class SavedPlace(models.Model):
    """Model for users' saved places"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_places')
    place = models.ForeignKey(Place, on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'saved_places'
        unique_together = ['user', 'place'] 