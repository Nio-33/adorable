import os
from celery import Celery
from django.conf import settings
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adorable_backend.config.settings.base')

# Create the Celery app
app = Celery('adorable_backend')

# Configure Celery using Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Configure task time limits
app.conf.update(
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=15 * 60,  # 15 minutes
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks
    worker_prefetch_multiplier=1,  # Disable prefetching
)

# Configure task queues
app.conf.task_queues = {
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
    },
    'high_priority': {
        'exchange': 'high_priority',
        'routing_key': 'high_priority',
    },
    'low_priority': {
        'exchange': 'low_priority',
        'routing_key': 'low_priority',
    },
}

# Configure scheduled tasks
app.conf.beat_schedule = {
    'cleanup-expired-tokens': {
        'task': 'adorable_backend.core.tasks.scheduled.cleanup_expired_tokens',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight
    },
    'update-place-rankings': {
        'task': 'adorable_backend.core.tasks.scheduled.update_place_rankings',
        'schedule': crontab(hour='*/1'),  # Every hour
    },
    'send-notification-digests': {
        'task': 'adorable_backend.core.tasks.scheduled.send_notification_digests',
        'schedule': crontab(hour=18, minute=0),  # Daily at 6 PM
    },
}

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    """Task for debugging purposes"""
    print(f'Request: {self.request!r}') 