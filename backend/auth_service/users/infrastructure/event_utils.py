"""
Event Utils - Implementación del puerto EventPublisherPort
"""
from users.infrastructure.event_store import event_store
from shared import publish_event
from users.application.ports.event_publisher_port import EventPublisherPort


class EventPublisher(EventPublisherPort):
    """Implementación concreta del puerto de publicación de eventos"""
    
    def persist_and_publish(self, event, routing_key: str):
        event_data = {
            **event.data,
            'timestamp': event.occurred_at,
        }
        event_store.append_event(
            aggregate_id=event.aggregate_id,
            event_type=event.event_type,
            data=event_data,
            aggregate_type=event.aggregate_type,
        )
        publish_event(routing_key, event_data)
        return event_data


# Instancia global (para inyección de dependencias)
event_publisher = EventPublisher()