from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, UserPreference

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone_number', 
                 'is_phone_verified', 'first_name', 'last_name')
        read_only_fields = ('is_phone_verified',)

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for Profile model"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ('id', 'user', 'avatar', 'bio', 'birth_date',
                 'location', 'interests', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class UserPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for UserPreference model"""
    class Meta:
        model = UserPreference
        fields = ('id', 'email_notifications', 'push_notifications',
                 'location_sharing', 'profile_visibility',
                 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at') 