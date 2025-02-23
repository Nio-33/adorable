import os
import uuid
from typing import Any, Dict, Optional
from datetime import datetime, timezone
from django.core.files.storage import default_storage
from django.utils.text import slugify

def generate_unique_slug(title: str, model: Any, max_length: int = 50) -> str:
    """Generate a unique slug for a model instance"""
    slug = slugify(title)[:max_length]
    unique_slug = slug
    num = 1
    
    while model.objects.filter(slug=unique_slug).exists():
        unique_slug = f"{slug}-{num}"
        num += 1
    
    return unique_slug

def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename while preserving the extension"""
    name, ext = os.path.splitext(original_filename)
    return f"{uuid.uuid4().hex}{ext}"

def save_file(file: Any, directory: str = 'uploads') -> str:
    """Save a file and return its path"""
    filename = generate_unique_filename(file.name)
    path = os.path.join(directory, filename)
    
    with default_storage.open(path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    
    return path

def format_timestamp(dt: datetime) -> str:
    """Format a datetime object to ISO 8601 string"""
    return dt.astimezone(timezone.utc).isoformat()

def parse_timestamp(timestamp: str) -> Optional[datetime]:
    """Parse an ISO 8601 timestamp string to datetime object"""
    try:
        return datetime.fromisoformat(timestamp)
    except (ValueError, TypeError):
        return None

def clean_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """Remove None values from a dictionary"""
    return {k: v for k, v in data.items() if v is not None}

def get_client_ip(request: Any) -> str:
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')

def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return os.path.splitext(filename)[1].lower()

def is_valid_image_extension(ext: str) -> bool:
    """Check if file extension is a valid image extension"""
    return ext.lower() in ['.jpg', '.jpeg', '.png', '.gif']

def is_valid_video_extension(ext: str) -> bool:
    """Check if file extension is a valid video extension"""
    return ext.lower() in ['.mp4', '.mov', '.avi', '.wmv']

def calculate_file_hash(file: Any) -> str:
    """Calculate SHA-256 hash of a file"""
    import hashlib
    sha256_hash = hashlib.sha256()
    
    for chunk in file.chunks():
        sha256_hash.update(chunk)
    
    return sha256_hash.hexdigest()

def format_file_size(size: int) -> str:
    """Format file size in bytes to human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024:
            return f"{size:.2f} {unit}"
        size /= 1024
    return f"{size:.2f} TB" 