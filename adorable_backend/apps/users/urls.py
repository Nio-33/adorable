from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProfileViewSet, UserPreferenceViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', ProfileViewSet)
router.register(r'preferences', UserPreferenceViewSet)

app_name = 'users'

urlpatterns = [
    path('', include(router.urls)),
] 