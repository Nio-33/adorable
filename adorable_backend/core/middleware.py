from time import time
from django.utils.deprecation import MiddlewareMixin
from .monitoring import monitoring_service

class MonitoringMiddleware(MiddlewareMixin):
    """Middleware for monitoring request metrics"""

    def process_request(self, request):
        """Store request start time"""
        request._monitoring_start_time = time()

    def process_response(self, request, response):
        """Record request metrics"""
        if hasattr(request, '_monitoring_start_time'):
            duration = (time() - request._monitoring_start_time) * 1000  # Convert to milliseconds
            
            # Record request metric
            monitoring_service.record_metric(
                name='request',
                value=duration,
                tags={
                    'method': request.method,
                    'path': request.path,
                    'status_code': str(response.status_code),
                    'user': str(request.user.id if request.user.is_authenticated else 'anonymous')
                }
            )
            
        return response 