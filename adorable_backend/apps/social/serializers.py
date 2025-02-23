from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Follow, Block, Report

User = get_user_model()

class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ('id', 'follower', 'followed', 'created_at')
        read_only_fields = ('id', 'follower', 'created_at')

    def create(self, validated_data):
        validated_data['follower'] = self.context['request'].user
        return super().create(validated_data)

class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ('id', 'blocker', 'blocked', 'reason', 'created_at')
        read_only_fields = ('id', 'blocker', 'created_at')

    def create(self, validated_data):
        validated_data['blocker'] = self.context['request'].user
        return super().create(validated_data)

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ('id', 'reporter', 'reported', 'type', 'description', 
                 'evidence', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'reporter', 'status', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        validated_data['status'] = 'pending'
        return super().create(validated_data) 