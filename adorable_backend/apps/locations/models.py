from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Location(models.Model):
    """Model for storing location information."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='locations',
        verbose_name=_('user')
    )
    
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    city = models.CharField(_('city'), max_length=100)
    state = models.CharField(_('state'), max_length=100, blank=True)
    country = models.CharField(_('country'), max_length=100)
    postal_code = models.CharField(_('postal code'), max_length=20)
    
    latitude = models.DecimalField(
        _('latitude'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        _('longitude'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    
    type = models.CharField(max_length=50, choices=[
        ('home', 'Home'),
        ('work', 'Work'),
        ('favorite', 'Favorite'),
        ('other', 'Other')
    ])
    
    is_primary = models.BooleanField(_('primary'), default=False)
    is_billing = models.BooleanField(_('billing'), default=False)
    is_shipping = models.BooleanField(_('shipping'), default=False)
    
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('location')
        verbose_name_plural = _('locations')
        ordering = ['-is_primary', '-created_at']
        indexes = [
            models.Index(fields=['user', 'is_primary']),
            models.Index(fields=['latitude', 'longitude']),
        ]
        unique_together = [['user', 'name']]
    
    def __str__(self):
        return f"{self.name} ({self.type}) - {self.user.username}"
    
    def save(self, *args, **kwargs):
        """Ensure only one primary location per user."""
        if self.is_primary:
            Location.objects.filter(user=self.user).update(is_primary=False)
        super().save(*args, **kwargs) 