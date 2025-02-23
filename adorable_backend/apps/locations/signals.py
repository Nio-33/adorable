from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg
from .models import PlaceReview, Place

@receiver([post_save, post_delete], sender=PlaceReview)
def update_place_rating(sender, instance, **kwargs):
    """Update place rating when a review is created, updated, or deleted"""
    place = instance.place
    
    # Calculate new average rating
    avg_rating = PlaceReview.objects.filter(place=place).aggregate(
        Avg('rating')
    )['rating__avg'] or 0.0
    
    # Update place rating and total ratings
    place.rating = avg_rating
 