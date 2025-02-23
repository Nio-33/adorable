from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.http import HttpResponse
from .monitoring import monitoring_service

@api_view(['GET'])
@permission_classes([IsAdminUser])
def system_metrics(request):
    """Get system metrics"""
    return Response(monitoring_service.get_system_metrics())

@api_view(['GET'])
@permission_classes([IsAdminUser])
def database_metrics(request):
    """Get database metrics"""
    return Response(monitoring_service.get_database_metrics())

@api_view(['GET'])
@permission_classes([IsAdminUser])
def cache_metrics(request):
    """Get cache metrics"""
    return Response(monitoring_service.get_cache_metrics())

@api_view(['GET'])
@permission_classes([IsAdminUser])
def request_metrics(request):
    """Get request metrics"""
    return Response(monitoring_service.get_request_metrics())

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_metrics(request):
    """Export all metrics as JSON file"""
    hours = int(request.GET.get('hours', 24))
    data = monitoring_service.export_metrics(hours)
    
    response = HttpResponse(data, content_type='application/json')
    response['Content-Disposition'] = f'attachment; filename=metrics_{hours}h.json'
    return response 