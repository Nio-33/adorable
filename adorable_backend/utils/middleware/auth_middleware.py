from django.utils.functional import SimpleLazyObject
from django.contrib.auth.middleware import get_user
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.auth.jwt import get_token_from_request

class JWTAuthenticationMiddleware(MiddlewareMixin):
    """Middleware to process JWT authentication for all requests"""

    def process_request(self, request):
        """Process each request to authenticate via JWT"""
        request.user = SimpleLazyObject(lambda: self.__get_user(request))
        return None

    def __get_user(self, request):
        """Get user from the JWT token"""
        user = get_user(request)
        if user.is_authenticated:
            return user

        # Try to authenticate with JWT
        token = get_token_from_request(request)
        if token:
            try:
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
                user, _ = jwt_auth.get_user(validated_token)
                return user
            except Exception:
                pass
        return user

class RequestLoggingMiddleware(MiddlewareMixin):
    """Middleware to log API requests"""

    def process_request(self, request):
        """Log incoming request details"""
        if settings.DEBUG:
            print(f"[Request] {request.method} {request.path}")
            print(f"Headers: {dict(request.headers)}")
        return None

    def process_response(self, request, response):
        """Log response details"""
        if settings.DEBUG:
            print(f"[Response] Status: {response.status_code}")
        return response

class APIVersionMiddleware(MiddlewareMixin):
    """Middleware to handle API versioning"""

    def process_request(self, request):
        """Process API version from request"""
        version = request.headers.get('X-API-Version', settings.API_VERSION_DEFAULT)
        request.version = version
        return None

class RateLimitMiddleware(MiddlewareMixin):
    """Middleware to implement rate limiting"""

    def process_request(self, request):
        """Check rate limits for the request"""
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return None

        # Implement rate limiting logic here
        # This is a placeholder for actual rate limiting implementation
        return None 