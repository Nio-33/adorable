from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Exists, OuterRef
from django.utils import timezone

from .models import Connection, Chat, Message, Notification, Activity
from .serializers import (
    ConnectionSerializer, ChatSerializer, MessageSerializer,
    NotificationSerializer, ActivitySerializer, ChatMessageSerializer
)
from ..core.permissions import IsParticipant
from ..services.firebase.service import firebase_service

class ConnectionViewSet(viewsets.ModelViewSet):
    """ViewSet for user connections"""
    serializer_class = ConnectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter connections for current user"""
        return Connection.objects.filter(
            Q(follower=self.request.user) |
            Q(following=self.request.user)
        ).select_related('follower', 'following')

    def perform_create(self, serializer):
        """Create a new connection"""
        serializer.save(follower=self.request.user)

    @action(detail=False, methods=['get'])
    def followers(self, request):
        """Get user's followers"""
        followers = Connection.objects.filter(
            following=request.user
        ).select_related('follower')
        serializer = self.get_serializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def following(self, request):
        """Get users being followed by current user"""
        following = Connection.objects.filter(
            follower=request.user
        ).select_related('following')
        serializer = self.get_serializer(following, many=True)
        return Response(serializer.data)

class ChatViewSet(viewsets.ModelViewSet):
    """ViewSet for chat rooms"""
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated, IsParticipant]

    def get_queryset(self):
        """Filter chats for current user"""
        return Chat.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants').annotate(
            unread_count=Count(
                'messages',
                filter=Q(messages__is_read=False) & ~Q(messages__sender=self.request.user)
            )
        )

    def perform_create(self, serializer):
        """Create a new chat and add current user as participant"""
        chat = serializer.save()
        chat.participants.add(self.request.user)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get messages for a chat"""
        chat = self.get_object()
        messages = chat.messages.select_related('sender').prefetch_related('read_by')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_participant(self, request, pk=None):
        """Add a participant to a chat"""
        chat = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        chat.participants.add(user_id)
        return Response({'status': 'participant added'})

class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for chat messages"""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsParticipant]

    def get_queryset(self):
        """Filter messages for chats the user is part of"""
        return Message.objects.filter(
            chat__participants=self.request.user
        ).select_related('sender', 'chat')

    def perform_create(self, serializer):
        """Create a new message and notify participants"""
        message = serializer.save(sender=self.request.user)
        
        # Notify other participants
        participants = message.chat.participants.exclude(id=self.request.user.id)
        
        for participant in participants:
            Notification.objects.create(
                user=participant,
                type='new_message',
                title='New Message',
                message=f'New message from {self.request.user.username}',
                data={
                    'chat_id': str(message.chat.id),
                    'message_id': str(message.id)
                }
            )
            
            # Send push notification
            firebase_service.send_notification(
                user_ids=str(participant.id),
                title='New Message',
                body=f'Message from {self.request.user.username}',
                data={
                    'type': 'chat_message',
                    'chat_id': str(message.chat.id)
                }
            )

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        if request.user.id not in message.read_by:
            message.read_by.append(request.user.id)
            message.save()
        return Response({'status': 'message marked as read'})

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter notifications for current user"""
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all notifications marked as read'})

class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user activities"""
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get activity feed for current user"""
        following = Connection.objects.filter(
            follower=self.request.user
        ).values_list('following_id', flat=True)
        
        return Activity.objects.filter(
            Q(user__in=following) |  # Activities from followed users
            Q(target_user=self.request.user)  # Activities targeting the user
        ).select_related('user', 'target_user', 'target_place')

    @action(detail=False, methods=['get'])
    def user_activities(self, request):
        """Get activities for a specific user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        activities = Activity.objects.filter(user_id=user_id)
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data) 