"""
Event Utils - Funciones auxiliares para eventos en menu_service
"""
from .event_store import event_store
from shared import publish_event


def persist_and_publish(event, routing_key):
    """
    Persiste un evento en el Event Store y lo publica en RabbitMQ
    
    Args:
        event: DomainEvent a persistir y publicar
        routing_key: Routing key para RabbitMQ
    
    Returns:
        Los datos del evento publicados
    """
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