from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('follows', views.FollowViewSet, basename='follow')
router.register('blocks', views.BlockViewSet, basename='block')
router.register('reports', views.ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
] 