from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import User

class File(models.Model):
    """Model for managing uploaded files"""
    FILE_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('other', 'Other')
    ]

    file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPES)
    original_filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    size = models.BigIntegerField()  # Size in bytes
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'files'
        indexes = [
            models.Index(fields=['file_type']),
            models.Index(fields=['uploaded_by']),
        ]

class Image(models.Model):
    """Model for storing image metadata"""
    file = models.OneToOneField(File, on_delete=models.CASCADE, related_name='image_metadata')
    width = models.IntegerField()
    height = models.IntegerField()
    format = models.CharField(max_length=10)  # e.g., JPEG, PNG
    has_thumbnail = models.BooleanField(default=False)
    thumbnail_path = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'images'

class Video(models.Model):
    """Model for storing video metadata"""
    file = models.OneToOneField(File, on_delete=models.CASCADE, related_name='video_metadata')
    duration = models.FloatField()  # Duration in seconds
    width = models.IntegerField()
    height = models.IntegerField()
    format = models.CharField(max_length=10)  # e.g., MP4, MOV
    has_thumbnail = models.BooleanField(default=False)
    thumbnail_path = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'videos'

class FilePermission(models.Model):
    """Model for managing file access permissions"""
    PERMISSION_TYPES = [
        ('private', 'Private'),
        ('public', 'Public'),
        ('shared', 'Shared')
    ]

    file = models.OneToOneField(File, on_delete=models.CASCADE, related_name='permission')
    permission_type = models.CharField(max_length=20, choices=PERMISSION_TYPES, default='private')
    shared_with = models.ManyToManyField(User, related_name='shared_files', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'file_permissions'

class FileUsage(models.Model):
    """Model for tracking file usage"""
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='usage_records')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    accessed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'file_usage'
        indexes = [
            models.Index(fields=['file', 'accessed_at']),
        ] 