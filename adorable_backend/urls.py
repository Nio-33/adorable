from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# API Documentation Schema
schema_view = get_schema_view(
    openapi.Info(
        title="Adorable API",
        default_version='v1',
        description="API for Adorable location-based social discovery platform",
        terms_of_service="https://www.adorable.com/terms/",
        contact=openapi.Contact(email="contact@adorable.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# API URL Patterns
api_urlpatterns = [
    path('users/', include('users.urls')),
    path('locations/', include('locations.urls')),
    path('social/', include('social.urls')),
    path('storage/', include('storage.urls')),
]

# Main URL Patterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_urlpatterns)),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 