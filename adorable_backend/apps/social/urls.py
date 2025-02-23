from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConnectionViewSet,
    ChatViewSet,
    MessageViewSet,
    NotificationViewSet,
    ActivityViewSet
)

router = DefaultRouter()
router.register(r'connections', ConnectionViewSet, basename='connection')
router.register(r'chats', ChatViewSet, basename='chat')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'activities', ActivityViewSet, basename='activity')

app_name = 'social'

urlpatterns = [
    path('', include(router.urls)),
] 