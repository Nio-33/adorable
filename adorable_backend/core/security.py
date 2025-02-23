import hmac
import hashlib
import time
import uuid
from typing import Optional, Tuple
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from .logging import LoggerMixin
from .exceptions import AuthenticationError

class SecurityService(LoggerMixin):
    """Service for handling security operations"""

    def __init__(self):
        """Initialize security service"""
        self.api_key_prefix = 'api_key:'
        self.api_key_timeout = 3600 * 24  # 24 hours
        self.request_timeout = 300  # 5 minutes
        self.max_timestamp_diff = 300  # 5 minutes

    def generate_api_key(self, client_id: str) -> Tuple[str, str]:
        """Generate new API key and secret"""
        api_key = f"ak_{uuid.uuid4().hex}"
        api_secret = f"as_{uuid.uuid4().hex}"
        
        # Store in cache with expiration
        cache_key = f"{self.api_key_prefix}{api_key}"
        cache.set(
            cache_key,
            {
                'client_id': client_id,
                'secret': api_secret,
                'created_at': datetime.now().isoformat()
            },
            self.api_key_timeout
        )
        
        return api_key, api_secret

    def rotate_api_key(self, current_api_key: str) -> Tuple[str, str]:
        """Rotate API key while maintaining a grace period"""
        # Get current key details
        current_key_data = cache.get(f"{self.api_key_prefix}{current_api_key}")
        if not current_key_data:
            raise AuthenticationError("Invalid API key")

        # Generate new key
        new_api_key, new_api_secret = self.generate_api_key(
            current_key_data['client_id']
        )

        # Keep old key valid for grace period (1 hour)
        cache.set(
            f"{self.api_key_prefix}{current_api_key}",
            current_key_data,
            3600  # 1 hour grace period
        )

        return new_api_key, new_api_secret

    def validate_api_key(self, api_key: str) -> Optional[dict]:
        """Validate API key and return associated data"""
        key_data = cache.get(f"{self.api_key_prefix}{api_key}")
        if not key_data:
            raise AuthenticationError("Invalid API key")
        return key_data

    def generate_request_signature(
        self,
        api_key: str,
        api_secret: str,
        method: str,
        path: str,
        params: dict,
        timestamp: int
    ) -> str:
        """Generate request signature"""
        # Create signing string
        signing_string = f"{method.upper()}\n{path}\n"
        
        # Add sorted query parameters
        if params:
            sorted_params = sorted(params.items())
            signing_string += "&".join(f"{k}={v}" for k, v in sorted_params)
        
        signing_string += f"\n{timestamp}"

        # Create signature
        signature = hmac.new(
            api_secret.encode(),
            signing_string.encode(),
            hashlib.sha256
        ).hexdigest()

        return signature

    def verify_request_signature(
        self,
        api_key: str,
        signature: str,
        method: str,
        path: str,
        params: dict,
        timestamp: int
    ) -> bool:
        """Verify request signature"""
        # Check timestamp freshness
        current_time = int(time.time())
        if abs(current_time - timestamp) > self.max_timestamp_diff:
            raise AuthenticationError("Request timestamp too old")

        # Get API key data
        key_data = self.validate_api_key(api_key)
        
        # Generate expected signature
        expected_signature = self.generate_request_signature(
            api_key,
            key_data['secret'],
            method,
            path,
            params,
            timestamp
        )

        # Compare signatures
        return hmac.compare_digest(signature, expected_signature)

    def validate_client_ip(self, ip_address: str, client_id: str) -> bool:
        """Validate if IP is whitelisted for client"""
        whitelist_key = f"ip_whitelist:{client_id}"
        whitelist = cache.get(whitelist_key) or []
        
        return ip_address in whitelist

    def add_ip_to_whitelist(self, ip_address: str, client_id: str) -> None:
        """Add IP to client's whitelist"""
        whitelist_key = f"ip_whitelist:{client_id}"
        whitelist = cache.get(whitelist_key) or []
        
        if ip_address not in whitelist:
            whitelist.append(ip_address)
            cache.set(whitelist_key, whitelist)

    def remove_ip_from_whitelist(self, ip_address: str, client_id: str) -> None:
        """Remove IP from client's whitelist"""
        whitelist_key = f"ip_whitelist:{client_id}"
        whitelist = cache.get(whitelist_key) or []
        
        if ip_address in whitelist:
            whitelist.remove(ip_address)
            cache.set(whitelist_key, whitelist)

    def generate_temporary_access_token(
        self,
        client_id: str,
        duration: int = 3600
    ) -> str:
        """Generate temporary access token"""
        token = f"tmp_{uuid.uuid4().hex}"
        
        cache.set(
            f"tmp_token:{token}",
            {
                'client_id': client_id,
                'created_at': datetime.now().isoformat()
            },
            duration
        )
        
        return token

    def validate_temporary_token(self, token: str) -> Optional[dict]:
        """Validate temporary access token"""
        token_data = cache.get(f"tmp_token:{token}")
        if not token_data:
            raise AuthenticationError("Invalid or expired temporary token")
        return token_data

# Create singleton instance
security_service = SecurityService() 