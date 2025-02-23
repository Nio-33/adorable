from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Custom user model for the application."""
    
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(_('phone number'), max_length=20, blank=True)
    avatar = models.ImageField(_('avatar'), upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(_('bio'), max_length=500, blank=True)
    date_of_birth = models.DateField(_('date of birth'), null=True, blank=True)
    is_verified = models.BooleanField(_('verified'), default=False)
    
    # Additional fields for user preferences
    language = models.CharField(_('language'), max_length=10, default='en')
    timezone = models.CharField(_('timezone'), max_length=50, default='UTC')
    notification_preferences = models.JSONField(_('notification preferences'), default=dict)
    privacy_settings = models.JSONField(_('privacy settings'), default=dict)
    
    # Fields for social features
    followers_count = models.PositiveIntegerField(_('followers count'), default=0)
    following_count = models.PositiveIntegerField(_('following count'), default=0)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.username
    
    def get_full_name(self):
        """Return the full name of the user."""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.username
    
    def get_short_name(self):
        """Return the short name of the user."""
        return self.first_name if self.first_name else self.username 