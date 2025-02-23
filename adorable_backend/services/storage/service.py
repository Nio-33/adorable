import os
import uuid
from typing import Optional, BinaryIO, Dict
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from PIL import Image
import io
import mimetypes

class StorageService:
    """Service for handling file storage operations"""

    ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']
    ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain']
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    def __init__(self):
        """Initialize storage service"""
        self.storage = default_storage

    def save_file(
        self,
        file_obj: BinaryIO,
        directory: str,
        filename: Optional[str] = None,
        allowed_types: Optional[list] = None,
        max_size: Optional[int] = None
    ) -> Dict:
        """Save a file to storage"""
        try:
            # Validate file type
            content_type = getattr(file_obj, 'content_type', 
                mimetypes.guess_type(filename)[0] if filename else None)
            
            if allowed_types and content_type not in allowed_types:
                raise ValueError(f"File type {content_type} not allowed")

            # Validate file size
            if max_size and file_obj.size > max_size:
                raise ValueError(f"File size exceeds maximum allowed size of {max_size} bytes")

            # Generate unique filename if not provided
            if not filename:
                ext = os.path.splitext(file_obj.name)[1] if hasattr(file_obj, 'name') else ''
                filename = f"{uuid.uuid4().hex}{ext}"

            # Ensure directory exists
            if not os.path.exists(os.path.join(settings.MEDIA_ROOT, directory)):
                os.makedirs(os.path.join(settings.MEDIA_ROOT, directory))

            # Save file
            path = os.path.join(directory, filename)
            saved_path = self.storage.save(path, ContentFile(file_obj.read()))

            return {
                'path': saved_path,
                'url': self.storage.url(saved_path),
                'size': file_obj.size,
                'content_type': content_type
            }

        except Exception as e:
            raise ValueError(f"Error saving file: {str(e)}")

    def save_image(
        self,
        image_file: BinaryIO,
        directory: str,
        filename: Optional[str] = None,
        max_size: Optional[tuple] = None,
        quality: int = 85
    ) -> Dict:
        """Save and process an image"""
        try:
            # Validate image file
            if not any(image_file.content_type == t for t in self.ALLOWED_IMAGE_TYPES):
                raise ValueError("Invalid image type")

            # Open image
            img = Image.open(image_file)
            
            # Convert to RGB if necessary
            if img.mode not in ('L', 'RGB'):
                img = img.convert('RGB')

            # Resize if max_size specified
            if max_size:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)

            # Save processed image
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=quality, optimize=True)
            buffer.seek(0)

            # Generate filename if not provided
            if not filename:
                filename = f"{uuid.uuid4().hex}.jpg"

            return self.save_file(
                buffer,
                directory,
                filename,
                allowed_types=self.ALLOWED_IMAGE_TYPES
            )

        except Exception as e:
            raise ValueError(f"Error processing image: {str(e)}")

    def delete_file(self, file_path: str) -> bool:
        """Delete a file from storage"""
        try:
            if self.storage.exists(file_path):
                self.storage.delete(file_path)
                return True
            return False
        except Exception as e:
            raise ValueError(f"Error deleting file: {str(e)}")

    def get_file_info(self, file_path: str) -> Optional[Dict]:
        """Get information about a file"""
        try:
            if not self.storage.exists(file_path):
                return None

            return {
                'path': file_path,
                'url': self.storage.url(file_path),
                'size': self.storage.size(file_path),
                'created': self.storage.get_created_time(file_path),
                'modified': self.storage.get_modified_time(file_path),
                'content_type': mimetypes.guess_type(file_path)[0]
            }

        except Exception as e:
            raise ValueError(f"Error getting file info: {str(e)}")

    def create_thumbnail(
        self,
        image_path: str,
        size: tuple,
        quality: int = 85
    ) -> Optional[Dict]:
        """Create a thumbnail from an existing image"""
        try:
            if not self.storage.exists(image_path):
                return None

            # Open original image
            with self.storage.open(image_path) as f:
                img = Image.open(f)
                
                # Convert to RGB if necessary
                if img.mode not in ('L', 'RGB'):
                    img = img.convert('RGB')

                # Create thumbnail
                img.thumbnail(size, Image.Resampling.LANCZOS)

                # Save thumbnail
                buffer = io.BytesIO()
                img.save(buffer, format='JPEG', quality=quality, optimize=True)
                buffer.seek(0)

                # Generate thumbnail path
                directory = os.path.dirname(image_path)
                filename = f"thumb_{os.path.basename(image_path)}"
                
                return self.save_file(
                    buffer,
                    directory,
                    filename,
                    allowed_types=self.ALLOWED_IMAGE_TYPES
                )

        except Exception as e:
            raise ValueError(f"Error creating thumbnail: {str(e)}")

# Create singleton instance
storage_service = StorageService() 