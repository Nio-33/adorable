from celery import shared_task
from django.utils import timezone
from django.db.models import Avg, Count
from datetime import timedelta

from ...apps.users.models import User
from ...apps.locations.models import Place, PlaceReview
from ...apps.social.models import Notification
from ...services.firebase.service import firebase_service

@shared_task
def cleanup_expired_tokens():
    """Clean up expired tokens from the database"""
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
    
    # Delete expired tokens
    expired_tokens = OutstandingToken.objects.filter(
        expires_at__lt=timezone.now()
    )
    deleted_count = expired_tokens.delete()[0]
    
    return f"Deleted {deleted_count} expired tokens"

@shared_task
def update_place_rankings():
    """Update place rankings based on reviews and activity"""
    # Get places with reviews in the last 24 hours
    recent_time = timezone.now() - timedelta(hours=24)
    
    places = Place.objects.annotate(
        avg_rating=Avg('reviews__rating'),
        review_count=Count('reviews'),
        recent_reviews=Count(
            'reviews',
            filter={'reviews__created_at__gte': recent_time}
        )
    )

    for place in places:
        # Calculate ranking score
        ranking_score = (
            (place.avg_rating or 0) * 0.5 +
            (min(place.review_count, 100) / 100) * 0.3 +
            (min(place.recent_reviews, 10) / 10) * 0.2
        )
        
        # Update place ranking
        place.ranking_score = ranking_score
        place.save(update_fields=['ranking_score'])
    
    return f"Updated rankings for {places.count()} places"

@shared_task
def send_notification_digests():
    """Send daily notification digests to users"""
    # Get users with unread notifications
    users = User.objects.filter(
        notifications__is_read=False,
        notifications__created_at__gte=timezone.now() - timedelta(days=1)
    ).distinct()

    for user in users:
        # Get unread notifications
        notifications = Notification.objects.filter(
            user=user,
            is_read=False,
            created_at__gte=timezone.now() - timedelta(days=1)
        )

        if notifications.exists():
            # Group notifications by type
            notification_groups = {}
            for notif in notifications:
                if notif.type not in notification_groups:
                    notification_groups[notif.type] = []
                notification_groups[notif.type].append(notif)

            # Send digest via Firebase
            firebase_service.send_notification(
                user_id=user.id,
                title="Daily Updates",
                body=f"You have {notifications.count()} new notifications",
                data={
                    'type': 'digest',
                    'count': notifications.count(),
                    'groups': notification_groups
                }
            )

            # Mark notifications as read
            notifications.update(is_read=True)

    return f"Sent notification digests to {users.count()} users"

@shared_task
def calculate_place_statistics():
    """Calculate and update place statistics"""
    places = Place.objects.annotate(
        total_reviews=Count('reviews'),
        avg_rating=Avg('reviews__rating')
    )

    for place in places:
        # Update statistics
        place.stats = {
            'total_reviews': place.total_reviews,
            'average_rating': float(place.avg_rating) if place.avg_rating else 0.0,
            'last_updated': timezone.now().isoformat()
        }
        place.save(update_fields=['stats'])

    return f"Updated statistics for {places.count()} places" 