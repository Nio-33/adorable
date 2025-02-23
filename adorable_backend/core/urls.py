from django.urls import path
from .views.health import (
    HealthCheckView,
    DetailedHealthCheckView,
    ServiceHealthCheckView
)
from . import views

app_name = 'core'

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health'),
    path('health/detailed/', DetailedHealthCheckView.as_view(), name='health-detailed'),
    path('health/service/<str:service_name>/', ServiceHealthCheckView.as_view(), name='health-service'),
    path('metrics/system/', views.system_metrics, name='system_metrics'),
    path('metrics/database/', views.database_metrics, name='database_metrics'),
    path('metrics/cache/', views.cache_metrics, name='cache_metrics'),
    path('metrics/requests/', views.request_metrics, name='request_metrics'),
    path('metrics/export/', views.export_metrics, name='export_metrics'),
] 