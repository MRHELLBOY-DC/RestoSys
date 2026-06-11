"""
Event Utils - Implementación del puerto EventPublisherPort
"""
from .event_store import event_store as default_event_store
from .messaging import publish_event
from menu.application.ports.event_publisher_port import EventPublisherPort


class EventPublisher(EventPublisherPort):
    """Implementación concreta del puerto de publicación de eventos"""
    
    def __init__(self, event_store=None):
        """
        Inicializa el EventPublisher
        
        Args:
            event_store: Instancia del EventStore (opcional)
        """
        self.event_store = event_store or default_event_store
    
    def persist_and_publish(self, event, routing_key: str):
        """Persiste el evento y lo publica en RabbitMQ"""
        event_data = {
            **event.data,
            'timestamp': event.occurred_at,
        }
        
        # Persistir en Event Store
        if self.event_store:
            self.event_store.append_event(
                aggregate_id=event.aggregate_id,
                event_type=event.event_type,
                data=event_data,
                aggregate_type=event.aggregate_type,
            )
        
        # Publicar a RabbitMQ
        publish_event(routing_key, event_data)
        
        return event_data

event_publisher = EventPublisher()