from django.apps import AppConfig

class ProfileSettingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'profile_settings'

    def ready(self):
        import profile_settings.signals
