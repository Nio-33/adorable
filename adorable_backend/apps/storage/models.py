from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.validators import FileExtensionValidator
import uuid


def file_upload_path(instance, filename):
    # Generate a unique path for each file
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"user_files/{instance.user.id}/{filename}"


class File(models.Model):
    """Model for storing file information."""
    
    FILE_TYPES = [
        ('image', _('Image')),
        ('video', _('Video')),
        ('document', _('Document')),
        ('audio', _('Audio')),
        ('other', _('Other')),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='files',
        verbose_name=_('user')
    )
    
    file = models.FileField(
        upload_to=file_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'])]
    )
    file_type = models.CharField(max_length=50)
    original_name = models.CharField(max_length=255)
    size = models.BigIntegerField()  # Size in bytes
    mime_type = models.CharField(max_length=100)
    
    # Metadata
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list)
    
    # Privacy settings
    is_public = models.BooleanField(default=False)
    password_protected = models.BooleanField(default=False)
    password_hash = models.CharField(max_length=128, blank=True)
    
    # Usage tracking
    download_count = models.PositiveIntegerField(default=0)
    last_accessed = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('file')
        verbose_name_plural = _('files')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'file_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.original_name
    
    def get_file_size_display(self):
        """Return human-readable file size."""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if self.size < 1024:
                return f"{self.size:.1f} {unit}"
            self.size /= 1024
        return f"{self.size:.1f} TB"


class SharedFile(models.Model):
    """Model for tracking file sharing."""
    
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('edit', 'Edit'),
        ('full', 'Full Access')
    ]
    
    file = models.ForeignKey(
        File,
        on_delete=models.CASCADE,
        related_name='shares',
        verbose_name=_('file')
    )
    shared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shared_files',
        verbose_name=_('shared by')
    )
    shared_with = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_files',
        verbose_name=_('shared with')
    )
    
    # Share settings
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES, default='view')
    can_reshare = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('shared file')
        verbose_name_plural = _('shared files')
        unique_together = ('file', 'shared_with')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.file.original_name} shared with {self.shared_with.username}" 