from django.db.models.signals import post_save, post_delete, m2m_changed
from django.dispatch import receiver
from django.db.models import F, Q
from .models import Connection, Chat, Message, Notification, Activity
from ..services.firebase.service import firebase_service

@receiver(post_save, sender=Connection)
def handle_new_connection(sender, instance, created, **kwargs):
    """Handle new connection creation"""
    if created:
        # Check for mutual connection
        mutual = Connection.objects.filter(
            follower=instance.following,
            following=instance.follower
        ).exists()
        
        if mutual:
            # Update both connections as mutual
            Connection.objects.filter(
                (Q(follower=instance.follower) & Q(following=instance.following)) |
                (Q(follower=instance.following) & Q(following=instance.follower))
            ).update(is_mutual=True)

        # Create notification for the followed user
        Notification.objects.create(
            user=instance.following,
            type='new_follower',
            title='New Follower',
            message=f'{instance.follower.username} started following you',
            data={
                'follower_id': str(instance.follower.id),
                'follower_username': instance.follower.username
            }
        )

        # Create activity
        Activity.objects.create(
            user=instance.follower,
            type='follow',
            target_user=instance.following,
            data={
                'follower_id': str(instance.follower.id),
                'following_id': str(instance.following.id)
            }
        )

        # Send push notification
        firebase_service.send_notification(
            user_ids=str(instance.following.id),
            title='New Follower',
            body=f'{instance.follower.username} started following you',
            data={
                'type': 'new_follower',
                'follower_id': str(instance.follower.id)
            }
        )

@receiver(post_save, sender=Message)
def handle_new_message(sender, instance, created, **kwargs):
    """Handle new message creation"""
    if created:
        # Update chat's last message and timestamp
        instance.chat.last_message = instance.content
        instance.chat.last_message_at = instance.created_at
        instance.chat.save()

        # Send real-time update via Firebase
        chat_ref = f'chats/{instance.chat.id}/messages'
        firebase_service.save_realtime_data(
            f'{chat_ref}/{instance.id}',
            {
                'id': str(instance.id),
                'sender_id': str(instance.sender.id),
                'content': instance.content,
                'created_at': instance.created_at.isoformat(),
                'is_read': False,
                'read_by': [],
                'attachment_url': instance.attachment_url,
                'attachment_type': instance.attachment_type
            }
        )

@receiver(m2m_changed, sender=Chat.participants.through)
def handle_chat_participants_change(sender, instance, action, pk_set, **kwargs):
    """Handle changes in chat participants"""
    if action == "post_add":
        for user_id in pk_set:
            # Create notification for new participants
            Notification.objects.create(
                user_id=user_id,
                type='chat_invite',
                title='New Chat',
                message=f'You were added to {instance.title or "a chat"}',
                data={
                    'chat_id': str(instance.id),
                    'chat_title': instance.title
                }
            )

            # Send push notification
            firebase_service.send_notification(
                user_ids=str(user_id),
                title='New Chat',
                body=f'You were added to {instance.title or "a chat"}',
                data={
                    'type': 'chat_invite',
                    'chat_id': str(instance.id)
                }
            )

@receiver(post_save, sender=Notification)
def handle_new_notification(sender, instance, created, **kwargs):
    """Handle new notification creation"""
    if created:
        # Send real-time update via Firebase
        firebase_service.save_realtime_data(
            f'notifications/{instance.user.id}/{instance.id}',
            {
                'id': str(instance.id),
                'type': instance.type,
                'title': instance.title,
                'message': instance.message,
                'data': instance.data,
                'is_read': instance.is_read,
                'created_at': instance.created_at.isoformat(),
                'action_url': instance.action_url
            }
        )

@receiver([post_save, post_delete], sender=Activity)
def handle_activity_change(sender, instance, **kwargs):
    """Handle activity creation or deletion"""
    # Get followers of the activity creator
    followers = Connection.objects.filter(
        following=instance.user
    ).values_list('follower_id', flat=True)

    # Update activity feed in Firebase for all followers
    for follower_id in followers:
        firebase_service.save_realtime_data(
            f'feeds/{follower_id}/activities/{instance.id}',
            {
                'id': str(instance.id),
                'type': instance.type,
                'user_id': str(instance.user.id),
                'target_user_id': str(instance.target_user.id) if instance.target_user else None,
                'target_place_id': str(instance.target_place.id) if instance.target_place else None,
                'data': instance.data,
                'created_at': instance.created_at.isoformat()
            } if kwargs.get('created', True) else None
        ) 