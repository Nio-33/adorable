from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext_lazy as _
from users.models import User
from locations.models import Place

class Connection(models.Model):
    """User connections/following model"""
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='following'
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='followers'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_mutual = models.BooleanField(default=False)

    class Meta:
        unique_together = ('follower', 'following')
        db_table = 'social_connections'

    def __str__(self):
        return f"{self.follower.username} -> {self.following.username}"

class Chat(models.Model):
    """Chat room model"""
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='chats'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_group_chat = models.BooleanField(default=False)
    title = models.CharField(max_length=255, null=True, blank=True)
    last_message = models.TextField(null=True, blank=True)
    last_message_at = models.DateTimeField(null=True)

    class Meta:
        db_table = 'social_chats'

    def __str__(self):
        return f"Chat {self.id} - {self.title or 'Direct Message'}"

class Message(models.Model):
    """Chat message model"""
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_messages'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    read_by = ArrayField(
        models.UUIDField(),
        default=list,
        blank=True
    )
    attachment_url = models.URLField(null=True, blank=True)
    attachment_type = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'social_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.username} in Chat {self.chat_id}"

class Notification(models.Model):
    """User notification model"""
    
    class NotificationType(models.TextChoices):
        NEW_FOLLOWER = 'new_follower', _('New Follower')
        NEW_MESSAGE = 'new_message', _('New Message')
        PLACE_REVIEW = 'place_review', _('Place Review')
        NEARBY_EVENT = 'nearby_event', _('Nearby Event')
        MENTION = 'mention', _('Mention')
        SYSTEM = 'system', _('System Notification')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    type = models.CharField(
        max_length=20,
        choices=NotificationType.choices
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    action_url = models.URLField(null=True, blank=True)

    class Meta:
        db_table = 'social_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} notification for {self.user.username}"

class Activity(models.Model):
    """User activity model"""
    
    class ActivityType(models.TextChoices):
        FOLLOW = 'follow', _('Follow')
        REVIEW = 'review', _('Review')
        VISIT = 'visit', _('Visit')
        SAVE_PLACE = 'save_place', _('Save Place')
        SHARE = 'share', _('Share')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    type = models.CharField(
        max_length=20,
        choices=ActivityType.choices
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='targeted_activities'
    )
    target_place = models.ForeignKey(
        'locations.Place',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities'
    )
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'social_activities'
        ordering = ['-created_at']
        verbose_name_plural = 'activities'

    def __str__(self):
        return f"{self.user.username}'s {self.type} activity" 