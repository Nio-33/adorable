import os
import logging.config
from datetime import datetime
from typing import Dict, Any
from django.conf import settings

def get_logging_config() -> Dict[str, Any]:
    """Get logging configuration"""
    log_dir = os.path.join(settings.BASE_DIR, 'logs')
    os.makedirs(log_dir, exist_ok=True)

    return {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
                'style': '{',
            },
            'simple': {
                'format': '{levelname} {message}',
                'style': '{',
            },
            'json': {
                '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
                'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
            }
        },
        'filters': {
            'require_debug_true': {
                '()': 'django.utils.log.RequireDebugTrue',
            },
        },
        'handlers': {
            'console': {
                'level': 'INFO',
                'filters': ['require_debug_true'],
                'class': 'logging.StreamHandler',
                'formatter': 'simple'
            },
            'file_error': {
                'level': 'ERROR',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': os.path.join(log_dir, 'error.log'),
                'maxBytes': 10485760,  # 10MB
                'backupCount': 10,
                'formatter': 'verbose'
            },
            'file_info': {
                'level': 'INFO',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': os.path.join(log_dir, 'info.log'),
                'maxBytes': 10485760,  # 10MB
                'backupCount': 10,
                'formatter': 'verbose'
            },
            'json_file': {
                'level': 'INFO',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': os.path.join(log_dir, 'json.log'),
                'maxBytes': 10485760,  # 10MB
                'backupCount': 10,
                'formatter': 'json'
            }
        },
        'loggers': {
            'django': {
                'handlers': ['console', 'file_info'],
                'level': 'INFO',
                'propagate': True,
            },
            'django.request': {
                'handlers': ['file_error'],
                'level': 'ERROR',
                'propagate': False,
            },
            'adorable': {
                'handlers': ['console', 'file_info', 'file_error', 'json_file'],
                'level': 'INFO',
                'propagate': True,
            },
            'adorable.security': {
                'handlers': ['file_error', 'json_file'],
                'level': 'INFO',
                'propagate': False,
            },
            'adorable.performance': {
                'handlers': ['json_file'],
                'level': 'INFO',
                'propagate': False,
            }
        }
    }

class LoggerMixin:
    """Mixin to add logging capabilities to classes"""
    
    @property
    def logger(self):
        if not hasattr(self, '_logger'):
            self._logger = logging.getLogger(f'adorable.{self.__class__.__module__}')
        return self._logger

    def log_info(self, message: str, **kwargs):
        """Log info level message"""
        self.logger.info(message, extra=kwargs)

    def log_error(self, message: str, exc_info=True, **kwargs):
        """Log error level message"""
        self.logger.error(message, exc_info=exc_info, extra=kwargs)

    def log_warning(self, message: str, **kwargs):
        """Log warning level message"""
        self.logger.warning(message, extra=kwargs)

    def log_debug(self, message: str, **kwargs):
        """Log debug level message"""
        self.logger.debug(message, extra=kwargs)

    def log_critical(self, message: str, exc_info=True, **kwargs):
        """Log critical level message"""
        self.logger.critical(message, exc_info=exc_info, extra=kwargs)

class RequestLogger:
    """Middleware to log requests"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('adorable.request')

    def __call__(self, request):
        start_time = datetime.now()
        
        response = self.get_response(request)
        
        duration = datetime.now() - start_time
        
        self.logger.info(
            'Request processed',
            extra={
                'path': request.path,
                'method': request.method,
                'duration_ms': duration.total_seconds() * 1000,
                'status_code': response.status_code,
                'user_id': getattr(request.user, 'id', None),
                'ip_address': request.META.get('REMOTE_ADDR'),
            }
        )
        
        return response

# Initialize logging configuration
logging.config.dictConfig(get_logging_config()) 