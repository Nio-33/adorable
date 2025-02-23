from django.http import HttpResponseForbidden
from django.conf import settings
from ..security import security_service
from ..logging import LoggerMixin

class SecurityMiddleware(LoggerMixin):
    """Middleware to enforce security measures"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip security checks for excluded paths
        if self._is_path_excluded(request.path):
            return self.get_response(request)

        try:
            # Validate API key and signature
            if not self._validate_request(request):
                return HttpResponseForbidden('Invalid request signature')

            # Validate IP whitelist
            if not self._validate_ip(request):
                return HttpResponseForbidden('IP not whitelisted')

            # Process request
            response = self.get_response(request)

            # Add security headers
            self._add_security_headers(response)

            return response

        except Exception as e:
            self.log_error(f"Security check failed: {str(e)}", exc_info=True)
            return HttpResponseForbidden('Security check failed')

    def _is_path_excluded(self, path: str) -> bool:
        """Check if path is excluded from security checks"""
        excluded_paths = [
            '/admin/',
            '/health/',
            '/api/docs/',
            '/static/',
            '/media/'
        ]
        return any(path.startswith(excluded) for excluded in excluded_paths)

    def _validate_request(self, request) -> bool:
        """Validate request signature"""
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return False

        signature = request.headers.get('X-Signature')
        timestamp = request.headers.get('X-Timestamp')
        
        if not all([signature, timestamp]):
            return False

        try:
            return security_service.verify_request_signature(
                api_key=api_key,
                signature=signature,
                method=request.method,
                path=request.path,
                params=request.GET.dict(),
                timestamp=int(timestamp)
            )
        except Exception as e:
            self.log_error(f"Signature validation failed: {str(e)}")
            return False

    def _validate_ip(self, request) -> bool:
        """Validate IP whitelist"""
        if not settings.ENFORCE_IP_WHITELIST:
            return True

        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return False

        try:
            key_data = security_service.validate_api_key(api_key)
            client_id = key_data['client_id']
            ip_address = self._get_client_ip(request)
            
            return security_service.validate_client_ip(ip_address, client_id)
        except Exception as e:
            self.log_error(f"IP validation failed: {str(e)}")
            return False

    def _get_client_ip(self, request) -> str:
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')

    def _add_security_headers(self, response) -> None:
        """Add security headers to response"""
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response['Content-Security-Policy'] = self._get_csp_header()
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Feature-Policy'] = self._get_feature_policy()

    def _get_csp_header(self) -> str:
        """Get Content Security Policy header value"""
        return "; ".join([
            "default-src 'self'",
            "img-src 'self' data: https:",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "font-src 'self' data:",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'"
        ])

    def _get_feature_policy(self) -> str:
        """Get Feature Policy header value"""
        return "; ".join([
            "geolocation 'self'",
            "camera 'none'",
            "microphone 'none'",
            "payment 'none'",
            "usb 'none'"
        ]) 