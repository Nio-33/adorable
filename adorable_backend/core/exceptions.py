from rest_framework.exceptions import APIException
from rest_framework import status
from typing import Dict, Any
import logging

# Configure logging
logger = logging.getLogger(__name__)

class AdorableBaseException(APIException):
    """Base exception class for Adorable backend"""
    def __init__(self, detail: str = None, code: str = None, status_code: int = None):
        super().__init__(detail)
        self.code = code
        self.status_code = status_code or status.HTTP_500_INTERNAL_SERVER_ERROR
        self.log_error()

    def log_error(self):
        """Log the error with appropriate level"""
        logger.error(
            f"Error: {self.__class__.__name__}",
            extra={
                'error_code': self.code,
                'detail': self.detail,
                'status_code': self.status_code
            }
        )

class ValidationError(AdorableBaseException):
    """Exception for validation errors"""
    def __init__(self, detail: str = None, code: str = 'validation_error'):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_400_BAD_REQUEST)

class AuthenticationError(AdorableBaseException):
    """Exception for authentication errors"""
    def __init__(self, detail: str = None, code: str = 'authentication_error'):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_401_UNAUTHORIZED)

class PermissionError(AdorableBaseException):
    """Exception for permission errors"""
    def __init__(self, detail: str = None, code: str = 'permission_error'):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_403_FORBIDDEN)

class NotFoundError(AdorableBaseException):
    """Exception for resource not found errors"""
    def __init__(self, detail: str = None, code: str = 'not_found'):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_404_NOT_FOUND)

class ServiceUnavailableError(AdorableBaseException):
    """Exception for service unavailability"""
    def __init__(self, detail: str = None, code: str = 'service_unavailable'):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_503_SERVICE_UNAVAILABLE)

class RateLimitError(AdorableBaseException):
    """Exception for rate limiting"""
    def __init__(self, detail: str = None, code: str = 'rate_limit_exceeded'):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_429_TOO_MANY_REQUESTS)

class DatabaseError(AdorableBaseException):
    """Exception for database errors"""
    def __init__(self, detail: str = None, code: str = 'database_error'):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExternalServiceError(AdorableBaseException):
    """Exception for external service errors"""
    def __init__(self, service: str, detail: str = None, code: str = 'external_service_error'):
        detail = detail or f"Error communicating with {service}"
        super().__init__(detail=detail, code=code, status_code=status.HTTP_502_BAD_GATEWAY)

def handle_exception(exc: Exception) -> Dict[str, Any]:
    """Global exception handler"""
    if isinstance(exc, AdorableBaseException):
        return {
            'error': {
                'code': exc.code,
                'message': str(exc.detail),
                'status_code': exc.status_code
            }
        }
    
    # Handle unexpected exceptions
    logger.critical(
        f"Unhandled exception: {exc.__class__.__name__}",
        exc_info=True,
        extra={'detail': str(exc)}
    )
    
    return {
        'error': {
            'code': 'internal_server_error',
            'message': 'An unexpected error occurred',
            'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
        }
    } 