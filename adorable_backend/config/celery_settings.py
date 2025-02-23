from datetime import timedelta
from kombu import Exchange, Queue

# Broker settings
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'django-db'

# Task settings
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TIMEZONE = 'UTC'
CELERY_ENABLE_UTC = True

# Task execution settings
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
CELERY_TASK_SOFT_TIME_LIMIT = 15 * 60  # 15 minutes
CELERY_WORKER_MAX_TASKS_PER_CHILD = 50
CELERY_WORKER_PREFETCH_MULTIPLIER = 1

# Queue settings
CELERY_TASK_DEFAULT_QUEUE = 'default'
CELERY_TASK_QUEUES = (
    Queue('default', Exchange('default'), routing_key='default'),
    Queue('high_priority', Exchange('high_priority'), routing_key='high_priority'),
    Queue('low_priority', Exchange('low_priority'), routing_key='low_priority'),
)

# Route tasks to queues
CELERY_TASK_ROUTES = {
    # High priority tasks
    'adorable_backend.core.tasks.handlers.process_user_photo': {'queue': 'high_priority'},
    'adorable_backend.core.tasks.handlers.send_push_notification': {'queue': 'high_priority'},
    
    # Default priority tasks
    'adorable_backend.core.tasks.handlers.geocode_place': {'queue': 'default'},
    'adorable_backend.core.tasks.scheduled.cleanup_expired_tokens': {'queue': 'default'},
    
    # Low priority tasks
    'adorable_backend.core.tasks.handlers.update_search_index': {'queue': 'low_priority'},
    'adorable_backend.core.tasks.scheduled.calculate_place_statistics': {'queue': 'low_priority'},
}

# Task result settings
CELERY_TASK_IGNORE_RESULT = False
CELERY_TASK_STORE_ERRORS_EVEN_IF_IGNORED = True
CELERY_TASK_COMPRESSION = 'gzip'

# Beat settings (for scheduled tasks)
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
CELERY_BEAT_MAX_LOOP_INTERVAL = 60  # 1 minute

# Monitoring settings
CELERY_SEND_TASK_SENT_EVENT = True
CELERY_TASK_SEND_SENT_EVENT = True

# Security settings
CELERY_SECURITY_KEY = 'secret-key'  # Change in production
CELERY_SECURITY_CERTIFICATE = None
CELERY_SECURITY_CERT_STORE = None

# Rate limiting
CELERY_TASK_DEFAULT_RATE_LIMIT = '1000/h'

# Error handling
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_TASK_REMOTE_TRACEBACKS = True
CELERY_TASK_REJECT_ON_WORKER_LOST = True 