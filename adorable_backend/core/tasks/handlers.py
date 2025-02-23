from celery import shared_task
from django.core.files.storage import default_storage
from django.utils import timezone
from PIL import Image
import io

from ...services.firebase.service import firebase_service
from ...services.mapbox.service import mapbox_service

@shared_task(
    bind=True,
    max_retries=3,
    rate_limit='60/m',
    queue='high_priority'
)
def process_user_photo(self, photo_path, user_id):
    """Process and optimize user profile photo"""
    try:
        # Read the image
        with default_storage.open(photo_path, 'rb') as f:
            img = Image.open(f)

        # Process image
        img = img.convert('RGB')
        
        # Create thumbnail
        thumbnail_size = (300, 300)
        img.thumbnail(thumbnail_size, Image.Resampling.LANCZOS)

        # Save processed image
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG', quality=85, optimize=True)
        
        # Generate new filename
        filename = photo_path.split('/')[-1]
        new_path = f'processed/{filename}'
        
        # Save to storage
        default_storage.save(new_path, buffer)
        
        return new_path

    except Exception as e:
        self.retry(exc=e, countdown=60)  # Retry after 1 minute

@shared_task(
    bind=True,
    max_retries=3,
    rate_limit='30/m',
    queue='default'
)
def geocode_place(self, place_id, address):
    """Geocode place address using MapBox"""
    try:
        # Get coordinates from MapBox
        coordinates = mapbox_service.geocode(address)
        
        if coordinates:
            from ...apps.locations.models import Place
            place = Place.objects.get(id=place_id)
            place.latitude = coordinates['lat']
            place.longitude = coordinates['lng']
            place.save(update_fields=['latitude', 'longitude'])
            
            return {
                'success': True,
                'coordinates': coordinates
            }
        
        return {
            'success': False,
            'error': 'No coordinates found'
        }

    except Exception as e:
        self.retry(exc=e, countdown=300)  # Retry after 5 minutes

@shared_task(
    bind=True,
    max_retries=5,
    rate_limit='100/m',
    queue='high_priority'
)
def send_push_notification(self, user_ids, title, body, data=None):
    """Send push notification to users via Firebase"""
    try:
        # Send notifications in batches
        batch_size = 500
        for i in range(0, len(user_ids), batch_size):
            batch = user_ids[i:i + batch_size]
            
            # Send to Firebase
            firebase_service.send_notification(
                user_ids=batch,
                title=title,
                body=body,
                data=data
            )
        
        return {
            'success': True,
            'total_sent': len(user_ids)
        }

    except Exception as e:
        self.retry(exc=e, countdown=60)  # Retry after 1 minute

@shared_task(
    bind=True,
    max_retries=3,
    rate_limit='50/m',
    queue='low_priority'
)
def update_search_index(self, place_id):
    """Update search index for a place"""
    try:
        from ...apps.locations.models import Place
        place = Place.objects.get(id=place_id)
        
        # Prepare search data
        search_data = {
            'id': str(place.id),
            'name': place.name,
            'description': place.description,
            'address': place.address,
            'category': place.category,
            'tags': place.tags,
            'rating': place.rating,
            'coordinates': {
                'lat': float(place.latitude),
                'lon': float(place.longitude)
            },
            'updated_at': timezone.now().isoformat()
        }
        
        # Update search index
        # Implementation depends on search service (Elasticsearch, Algolia, etc.)
        
        return {
            'success': True,
            'indexed_at': timezone.now().isoformat()
        }

    except Exception as e:
        self.retry(exc=e, countdown=300)  # Retry after 5 minutes