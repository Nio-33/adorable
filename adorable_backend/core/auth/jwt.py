from datetime import timedelta
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class AdorableJWTAuthentication(JWTAuthentication):
    """Custom JWT Authentication for Adorable platform"""

    def get_validated_token(self, raw_token):
        """Validate the token and handle custom claims"""
        try:
            return super().get_validated_token(raw_token)
        except TokenError as e:
            raise InvalidToken(f'Token validation failed: {str(e)}')

def generate_tokens_for_user(user):
    """Generate access and refresh tokens for a user"""
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims
    refresh['user_id'] = str(user.id)
    refresh['username'] = user.username
    refresh['is_staff'] = user.is_staff

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'expires_in': int(settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME', timedelta(minutes=60)).total_seconds()),
        'token_type': 'Bearer'
    }

def get_token_from_request(request):
    """Extract token from request header"""
    auth_header = request.META.get('HTTP_AUTHORIZATION', '').split()
    if len(auth_header) == 2 and auth_header[0].lower() == 'bearer':
        return auth_header[1]
    return None 