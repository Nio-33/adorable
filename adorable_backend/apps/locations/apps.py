from django.apps import AppConfig

class LocationsConfig(AppConfig):
    name = 'adorable_backend.apps.locations'
    verbose_name = 'Locations'

    def ready(self):
        import adorable_backend.apps.locations.signals  # noqa 