from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class MenuConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'menu'
    
    def ready(self):
        """Importar señales y configuraciones cuando la app esté lista"""
        print("=" * 50)
        print("MENU SERVICE - ready() called")
        print("=" * 50)
        logger.info("=" * 50)
        logger.info("MENU SERVICE - ready() called")
        logger.info("=" * 50)
        
        from .infrastructure import models
        
        # Iniciar consumidor de eventos de RabbitMQ (solo si no estamos en migraciones)
        import sys
        print(f"sys.argv: {sys.argv}")
        if 'migrate' not in sys.argv and 'makemigrations' not in sys.argv:
            print("Iniciando consumidor de eventos...")
            self._start_event_consumer()
        else:
            print(f"Saltando consumidor porque argv contiene: {sys.argv}")
    
    def _start_event_consumer(self):
        """Inicia el consumidor de forma más robusta"""
        print("=" * 60)
        print("INICIANDO CONSUMIDOR RABBITMQ - MENU SERVICE")
        print("=" * 60)
        
        try:
            from menu.infrastructure.messaging import get_event_consumer
            from menu.application.event_handlers import register_restaurant_handlers
            
            consumer = get_event_consumer()
            register_restaurant_handlers(consumer)
            
            # Iniciar en hilo daemon
            thread = consumer.start_in_thread()
            print("Consumidor RabbitMQ iniciado correctamente en hilo background")
            
        except Exception as e:
            print(f"ERROR CRÍTICO al iniciar consumidor: {e}")
            import traceback
            traceback.print_exc()