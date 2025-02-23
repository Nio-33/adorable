from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from ..health import health_check
from ..logging import LoggerMixin

class HealthCheckView(APIView, LoggerMixin):
    """View for basic health check"""
    
    def get(self, request):
        """Get basic health status"""
        try:
            result = health_check.check_all()
            return Response(result)
        except Exception as e:
            self.log_error("Health check failed", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DetailedHealthCheckView(APIView, LoggerMixin):
    """View for detailed health check (admin only)"""
    permission_classes = [IsAdminUser]
    
    @method_decorator(cache_page(60))  # Cache for 1 minute
    def get(self, request):
        """Get detailed health status"""
        try:
            health_status = health_check.check_all()
            metrics = health_check.get_service_metrics()
            
            return Response({
                'health': health_status,
                'metrics': metrics
            })
        except Exception as e:
            self.log_error("Detailed health check failed", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ServiceHealthCheckView(APIView, LoggerMixin):
    """View for checking specific service health"""
    permission_classes = [IsAdminUser]
    
    def get(self, request, service_name):
        """Get health status for specific service"""
        try:
            if service_name not in health_check.services:
                return Response(
                    {'error': f'Unknown service: {service_name}'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            result = health_check.services[service_name]()
            return Response(result)
        except Exception as e:
            self.log_error(f"Service health check failed: {service_name}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 