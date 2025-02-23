from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Add your API endpoints here
    path('api/users/', include('apps.users.urls')),
    path('api/locations/', include('apps.locations.urls')),
    path('api/social/', include('apps.social.urls')),
    path('api/storage/', include('apps.storage.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 