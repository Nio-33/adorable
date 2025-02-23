from typing import Any, Optional, Union
from functools import wraps
import json
from django.core.cache import cache
from django.conf import settings
import redis
from .logging import LoggerMixin

class CacheService(LoggerMixin):
    """Service for handling caching operations"""

    def __init__(self):
        """Initialize cache service"""
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        self.default_timeout = 3600  # 1 hour

    def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache"""
        try:
            value = self.redis_client.get(key)
            if value is None:
                return default
            return json.loads(value)
        except Exception as e:
            self.log_error(f"Error getting cache key {key}: {str(e)}")
            return default

    def set(
        self,
        key: str,
        value: Any,
        timeout: Optional[int] = None,
        nx: bool = False
    ) -> bool:
        """Set value in cache"""
        try:
            timeout = timeout or self.default_timeout
            value_str = json.dumps(value)
            
            if nx:
                return bool(self.redis_client.set(
                    key,
                    value_str,
                    ex=timeout,
                    nx=True
                ))
            
            return bool(self.redis_client.set(
                key,
                value_str,
                ex=timeout
            ))
        except Exception as e:
            self.log_error(f"Error setting cache key {key}: {str(e)}")
            return False

    def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            self.log_error(f"Error deleting cache key {key}: {str(e)}")
            return False

    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment value in cache"""
        try:
            return self.redis_client.incrby(key, amount)
        except Exception as e:
            self.log_error(f"Error incrementing cache key {key}: {str(e)}")
            return None

    def decrement(self, key: str, amount: int = 1) -> Optional[int]:
        """Decrement value in cache"""
        try:
            return self.redis_client.decrby(key, amount)
        except Exception as e:
            self.log_error(f"Error decrementing cache key {key}: {str(e)}")
            return None

    def get_many(self, keys: list) -> dict:
        """Get multiple values from cache"""
        try:
            values = self.redis_client.mget(keys)
            return {
                key: json.loads(value) if value else None
                for key, value in zip(keys, values)
            }
        except Exception as e:
            self.log_error(f"Error getting multiple cache keys: {str(e)}")
            return {}

    def set_many(self, mapping: dict, timeout: Optional[int] = None) -> bool:
        """Set multiple values in cache"""
        try:
            timeout = timeout or self.default_timeout
            pipeline = self.redis_client.pipeline()
            
            for key, value in mapping.items():
                pipeline.set(
                    key,
                    json.dumps(value),
                    ex=timeout
                )
            
            pipeline.execute()
            return True
        except Exception as e:
            self.log_error(f"Error setting multiple cache keys: {str(e)}")
            return False

    def delete_many(self, keys: list) -> bool:
        """Delete multiple values from cache"""
        try:
            self.redis_client.delete(*keys)
            return True
        except Exception as e:
            self.log_error(f"Error deleting multiple cache keys: {str(e)}")
            return False

    def clear(self) -> bool:
        """Clear all cache"""
        try:
            self.redis_client.flushdb()
            return True
        except Exception as e:
            self.log_error(f"Error clearing cache: {str(e)}")
            return False

    def get_or_set(
        self,
        key: str,
        default_func: callable,
        timeout: Optional[int] = None
    ) -> Any:
        """Get value from cache or set it if not exists"""
        value = self.get(key)
        if value is None:
            value = default_func()
            self.set(key, value, timeout)
        return value

def cache_decorator(
    timeout: Optional[int] = None,
    key_prefix: str = '',
    include_user: bool = False
):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}"
            
            # Add arguments to cache key
            if args:
                cache_key += f":{':'.join(str(arg) for arg in args)}"
            if kwargs:
                cache_key += f":{':'.join(f'{k}={v}' for k, v in sorted(kwargs.items()))}"
            
            # Add user ID if required
            if include_user and 'request' in kwargs:
                user_id = getattr(kwargs['request'].user, 'id', None)
                if user_id:
                    cache_key += f":user_{user_id}"
            
            # Try to get from cache
            cached_value = cache_service.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Calculate value and cache it
            value = func(*args, **kwargs)
            cache_service.set(cache_key, value, timeout)
            return value
            
        return wrapper
    return decorator

# Create singleton instance
cache_service = CacheService() 