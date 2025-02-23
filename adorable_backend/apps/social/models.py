from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Follow(models.Model):
    """Model for user following relationships."""
    
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='following',
        verbose_name=_('follower')
    )
    followed = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='followers',
        verbose_name=_('following')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('follow')
        verbose_name_plural = _('follows')
        unique_together = ('follower', 'followed')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.follower.username} follows {self.followed.username}"


class Block(models.Model):
    """Model for user blocking relationships."""
    
    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocking',
        verbose_name=_('user')
    )
    blocked = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocked_by',
        verbose_name=_('blocked user')
    )
    reason = models.TextField(_('reason'), blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('block')
        verbose_name_plural = _('blocks')
        unique_together = ('blocker', 'blocked')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.blocker.username} blocked {self.blocked.username}"

    def save(self, *args, **kwargs):
        # When blocking a user, remove any existing follow relationships
        Follow.objects.filter(
            models.Q(follower=self.blocker, followed=self.blocked) |
            models.Q(follower=self.blocked, followed=self.blocker)
        ).delete()
        super().save(*args, **kwargs)


class Report(models.Model):
    """Model for user reports."""
    
    REPORT_TYPES = [
        ('spam', _('Spam')),
        ('abuse', _('Abuse')),
        ('inappropriate', _('Inappropriate Content')),
        ('other', _('Other')),
    ]
    
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('investigating', _('Investigating')),
        ('resolved', _('Resolved')),
        ('dismissed', _('Dismissed')),
    ]
    
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_filed',
        verbose_name=_('reporter')
    )
    reported = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_received',
        verbose_name=_('reported user')
    )
    type = models.CharField(
        _('report type'),
        max_length=20,
        choices=REPORT_TYPES
    )
    description = models.TextField(_('description'))
    evidence = models.FileField(
        _('evidence'),
        upload_to='reports/',
        null=True,
        blank=True
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('report')
        verbose_name_plural = _('reports')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report by {self.reporter.username} against {self.reported.username}" 