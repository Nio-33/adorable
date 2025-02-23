from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlaceViewSet, PlacePhotoViewSet, PlaceReviewViewSet,
    UserLocationViewSet, SavedPlaceViewSet
)

router = DefaultRouter()
router.register(r'places', PlaceViewSet)
router.register(r'photos', PlacePhotoViewSet)
router.register(r'reviews', PlaceReviewViewSet)
router.register(r'user-locations', UserLocationViewSet, basename='user-location')
router.register(r'saved-places', SavedPlaceViewSet, basename='saved-place')

app_name = 'locations'

urlpatterns = [
    path('', include(router.urls)),
] 