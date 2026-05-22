"""
Event Publisher - Usa el módulo shared para RabbitMQ
Redirige al EventPublisher centralizado
"""
from shared.messaging import EventPublisher, publish_event, get_event_publisher
from shared.events import (
    USER_CREATED,
    USER_UPDATED,
    USER_DELETED,
)

# Re-exportar para mantener compatibilidad con código existente
__all__ = [
    'EventPublisher',
    'publish_event',
    'get_event_publisher',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DELETED',
]

# Mantener la instancia global para compatibilidad
event_publisher = get_event_publisher()