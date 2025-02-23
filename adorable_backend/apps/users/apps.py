from django.apps import AppConfig

class UsersConfig(AppConfig):
    name = 'adorable_backend.apps.users'
    verbose_name = 'Users'

    def ready(self):
        import adorable_backend.apps.users.signals  # noqa 