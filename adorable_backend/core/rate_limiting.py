from typing import Optional, Callable
from functools import wraps
from django.core.cache import cache
from django.conf import settings
from .exceptions import RateLimitError
from .logging import LoggerMixin

class RateLimiter(LoggerMixin):
    """Rate limiter implementation"""

    def __init__(
        self,
        key: str,
        limit: int,
        period: int,
        scope: Optional[str] = None
    ):
        """Initialize rate limiter"""
        self.key = key
        self.limit = limit
        self.period = period
        self.scope = scope or 'default'
        self._cache_key = f"rate_limit:{self.scope}:{self.key}"

    def is_allowed(self, identifier: str) -> bool:
        """Check if request is allowed"""
        cache_key = f"{self._cache_key}:{identifier}"
        count = cache.get(cache_key, 0)
        
        if count >= self.limit:
            return False
            
        # Increment counter
        if count == 0:
            cache.set(cache_key, 1, self.period)
        else:
            cache.incr(cache_key)
            
        return True

    def get_remaining(self, identifier: str) -> int:
        """Get remaining requests"""
        cache_key = f"{self._cache_key}:{identifier}"
        count = cache.get(cache_key, 0)
        return max(0, self.limit - count)

    def reset(self, identifier: str) -> None:
        """Reset rate limit for identifier"""
        cache_key = f"{self._cache_key}:{identifier}"
        cache.delete(cache_key)

class RateLimitManager(LoggerMixin):
    """Manager for rate limiters"""

    def __init__(self):
        """Initialize rate limit manager"""
        self.rate_limiters = {}
        self._setup_default_limiters()

    def _setup_default_limiters(self):
        """Setup default rate limiters"""
        self.register(
            'api_default',
            limit=1000,
            period=3600,  # 1 hour
            scope='api'
        )
        self.register(
            'auth_attempts',
            limit=5,
            period=300,  # 5 minutes
            scope='auth'
        )
        self.register(
            'ip_default',
            limit=10000,
            period=86400,  # 24 hours
            scope='ip'
        )

    def register(
        self,
        key: str,
        limit: int,
        period: int,
        scope: Optional[str] = None
    ) -> RateLimiter:
        """Register a new rate limiter"""
        limiter = RateLimiter(key, limit, period, scope)
        self.rate_limiters[key] = limiter
        return limiter

    def get(self, key: str) -> Optional[RateLimiter]:
        """Get rate limiter by key"""
        return self.rate_limiters.get(key)

    def check_rate_limit(
        self,
        key: str,
        identifier: str,
        raise_error: bool = True
    ) -> bool:
        """Check rate limit"""
        limiter = self.get(key)
        if not limiter:
            return True

        is_allowed = limiter.is_allowed(identifier)
        if not is_allowed and raise_error:
            remaining_time = self._get_reset_time(key, identifier)
            raise RateLimitError(
                f"Rate limit exceeded. Try again in {remaining_time} seconds"
            )

        return is_allowed

    def _get_reset_time(self, key: str, identifier: str) -> int:
        """Get time until rate limit reset"""
        limiter = self.get(key)
        if not limiter:
            return 0

        cache_key = f"rate_limit:{limiter.scope}:{limiter.key}:{identifier}"
        ttl = cache.ttl(cache_key)
        return max(0, ttl)

def rate_limit(
    key: str,
    limit: Optional[int] = None,
    period: Optional[int] = None,
    scope: Optional[str] = None,
    identifier_func: Optional[Callable] = None
):
    """Decorator for rate limiting"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Get or create rate limiter
            limiter = rate_limit_manager.get(key)
            if not limiter and limit and period:
                limiter = rate_limit_manager.register(
                    key,
                    limit,
                    period,
                    scope
                )

            if limiter:
                # Get identifier
                if identifier_func:
                    identifier = identifier_func(*args, **kwargs)
                else:
                    # Default to first argument (usually request)
                    request = args[0]
                    identifier = getattr(
                        request.user,
                        'id',
                        request.META.get('REMOTE_ADDR', 'anonymous')
                    )

                # Check rate limit
                rate_limit_manager.check_rate_limit(key, str(identifier))

            return func(*args, **kwargs)
        return wrapper
    return decorator

# Create singleton instance
rate_limit_manager = RateLimitManager() 