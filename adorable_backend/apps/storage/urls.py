from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('files', views.FileViewSet, basename='file')
router.register('shared', views.SharedFileViewSet, basename='shared-file')

urlpatterns = [
    path('', include(router.urls)),
] 