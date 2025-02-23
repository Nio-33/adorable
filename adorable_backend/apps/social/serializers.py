from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Connection, Chat, Message, Notification, Activity
from ..users.serializers import UserSerializer

User = get_user_model()

class ConnectionSerializer(serializers.ModelSerializer):
    """Serializer for user connections"""
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)
    following_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='following'
    )

    class Meta:
        model = Connection
        fields = ('id', 'follower', 'following', 'following_id',
                 'created_at', 'is_mutual')
        read_only_fields = ('is_mutual',)

class ChatSerializer(serializers.ModelSerializer):
    """Serializer for chat rooms"""
    participants = UserSerializer(many=True, read_only=True)
    participant_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        source='participants'
    )
    last_message = serializers.CharField(read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ('id', 'participants', 'participant_ids', 'created_at',
                 'updated_at', 'is_group_chat', 'title', 'last_message',
                 'last_message_at', 'unread_count')

    def get_unread_count(self, obj):
        """Get count of unread messages for the current user"""
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()

class MessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    sender = UserSerializer(read_only=True)
    read_by = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'chat', 'sender', 'content', 'created_at',
                 'is_read', 'read_by', 'attachment_url', 'attachment_type')
        read_only_fields = ('sender', 'is_read', 'read_by')

    def create(self, validated_data):
        """Create a new message"""
        validated_data['sender'] = self.context['request'].user
        message = super().create(validated_data)
        
        # Update chat's last message
        chat = message.chat
        chat.last_message = message.content
        chat.last_message_at = message.created_at
        chat.save()
        
        return message

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    class Meta:
        model = Notification
        fields = ('id', 'user', 'type', 'title', 'message', 'data',
                 'is_read', 'created_at', 'action_url')
        read_only_fields = ('user',)

class ActivitySerializer(serializers.ModelSerializer):
    """Serializer for user activities"""
    user = UserSerializer(read_only=True)
    target_user = UserSerializer(read_only=True)
    target_place = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = ('id', 'user', 'type', 'target_user', 'target_place',
                 'data', 'created_at')
        read_only_fields = ('user',)

    def get_target_place(self, obj):
        """Get place details if exists"""
        if obj.target_place:
            from ..locations.serializers import PlaceSerializer
            return PlaceSerializer(obj.target_place).data
        return None

class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages with chat details"""
    chat = ChatSerializer(read_only=True)
    sender = UserSerializer(read_only=True)
    read_by = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'chat', 'sender', 'content', 'created_at',
                 'is_read', 'read_by', 'attachment_url', 'attachment_type')
        read_only_fields = ('chat', 'sender', 'is_read', 'read_by') 