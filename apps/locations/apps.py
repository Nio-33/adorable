from django.apps import AppConfig
import os


class LocationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.locations'
    path = os.path.dirname(os.path.abspath(__file__))
    verbose_name = 'Locations' 