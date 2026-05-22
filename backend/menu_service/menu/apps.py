from django.apps import AppConfig


class MenuConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'menu'
    
    def ready(self):
        """Importar señales y configuraciones cuando la app esté lista"""
        # Importar modelos de infraestructura para que Django los reconozca
        from .infrastructure import models