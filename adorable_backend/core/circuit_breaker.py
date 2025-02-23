from functools import wraps
from datetime import datetime, timedelta
from typing import Any, Callable, Dict, Optional
from django.core.cache import cache
from .logging import LoggerMixin
from .exceptions import ServiceUnavailableError

class CircuitBreaker(LoggerMixin):
    """Circuit breaker implementation for external service calls"""

    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        reset_timeout: int = 60,
        half_open_timeout: int = 30
    ):
        """Initialize circuit breaker"""
        self.name = name
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.half_open_timeout = half_open_timeout
        self._cache_key_state = f"circuit_breaker:{name}:state"
        self._cache_key_failures = f"circuit_breaker:{name}:failures"
        self._cache_key_last_failure = f"circuit_breaker:{name}:last_failure"

    def get_state(self) -> str:
        """Get current circuit state"""
        return cache.get(self._cache_key_state, 'closed')

    def get_failures(self) -> int:
        """Get current failure count"""
        return cache.get(self._cache_key_failures, 0)

    def record_failure(self) -> None:
        """Record a failure"""
        failures = cache.get(self._cache_key_failures, 0) + 1
        cache.set(self._cache_key_failures, failures)
        cache.set(self._cache_key_last_failure, datetime.now().isoformat())

        if failures >= self.failure_threshold:
            self.open_circuit()

    def record_success(self) -> None:
        """Record a success"""
        cache.delete(self._cache_key_failures)
        if self.get_state() == 'half-open':
            self.close_circuit()

    def open_circuit(self) -> None:
        """Open the circuit"""
        cache.set(self._cache_key_state, 'open')
        self.log_warning(f"Circuit {self.name} opened")

    def close_circuit(self) -> None:
        """Close the circuit"""
        cache.set(self._cache_key_state, 'closed')
        cache.delete(self._cache_key_failures)
        self.log_info(f"Circuit {self.name} closed")

    def half_open_circuit(self) -> None:
        """Set circuit to half-open state"""
        cache.set(self._cache_key_state, 'half-open')
        self.log_info(f"Circuit {self.name} half-opened")

    def can_execute(self) -> bool:
        """Check if execution is allowed"""
        state = self.get_state()
        
        if state == 'closed':
            return True
            
        if state == 'open':
            last_failure = cache.get(self._cache_key_last_failure)
            if last_failure:
                last_failure_time = datetime.fromisoformat(last_failure)
                if datetime.now() - last_failure_time > timedelta(seconds=self.reset_timeout):
                    self.half_open_circuit()
                    return True
            return False
            
        # Half-open state
        return True

    def __call__(self, func: Callable) -> Callable:
        """Decorator for circuit breaker"""
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not self.can_execute():
                raise ServiceUnavailableError(
                    f"Circuit {self.name} is open"
                )

            try:
                result = func(*args, **kwargs)
                self.record_success()
                return result
            except Exception as e:
                self.record_failure()
                raise e

        return wrapper

class CircuitBreakerManager(LoggerMixin):
    """Manager for circuit breakers"""
    
    def __init__(self):
        """Initialize circuit breaker manager"""
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}

    def get_or_create(
        self,
        name: str,
        failure_threshold: int = 5,
        reset_timeout: int = 60,
        half_open_timeout: int = 30
    ) -> CircuitBreaker:
        """Get or create a circuit breaker"""
        if name not in self.circuit_breakers:
            self.circuit_breakers[name] = CircuitBreaker(
                name,
                failure_threshold,
                reset_timeout,
                half_open_timeout
            )
        return self.circuit_breakers[name]

    def reset_all(self) -> None:
        """Reset all circuit breakers"""
        for breaker in self.circuit_breakers.values():
            breaker.close_circuit()

    def get_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all circuit breakers"""
        status = {}
        for name, breaker in self.circuit_breakers.items():
            status[name] = {
                'state': breaker.get_state(),
                'failures': breaker.get_failures(),
                'last_failure': cache.get(breaker._cache_key_last_failure)
            }
        return status

# Create singleton instance
circuit_breaker_manager = CircuitBreakerManager() 