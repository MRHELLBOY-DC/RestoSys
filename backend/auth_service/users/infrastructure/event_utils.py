"""
Event Utils - Implementación del puerto EventPublisherPort
"""
from venv import logger

from users.infrastructure.messaging import publish_event
from users.application.ports.event_publisher_port import EventPublisherPort


class EventPublisher(EventPublisherPort):
    """Implementación concreta del puerto de publicación de eventos"""
    
    def __init__(self, event_store):
        """
        Inicializa el EventPublisher con un event_store inyectado
        
        Args:
            event_store: Instancia de EventStore (desde el contenedor)
        """
        self.event_store = event_store
    
    def persist_and_publish(self, event, routing_key: str):
        event_data = {
            **event.data,
            'timestamp': event.occurred_at,
        }
        
        print(f"DEBUG persist_and_publish: routing_key={routing_key}, aggregate_id={event.aggregate_id}")
        
        try:
            # Llamada al append
            self.event_store.append(
                aggregate_id=event.aggregate_id,
                event_type=event.event_type,
                data=event_data,
                aggregate_type=event.aggregate_type
            )
            print(f"Evento guardado en EventStore correctamente")
            
            # Publicar a RabbitMQ
            publish_success = publish_event(routing_key, event_data)
            if publish_success:
                logger.info(f"Evento publicado a RabbitMQ: {routing_key}")
                print(f"Publicado a RabbitMQ: {routing_key}")
            else:
                logger.warning(f"publish_event retornó False")
        except Exception as e:
            logger.error(f"Error en persist_and_publish ({routing_key}): {e}", exc_info=True)
            print(f"EXCEPCIÓN en persist_and_publish: {e}")
        
        return event_data