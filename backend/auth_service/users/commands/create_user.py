"""
Command: Create User
CQRS - Command para crear usuario
"""
from datetime import datetime
from users.models import Event
from users.events import event_store, publish_event


def create_user_event(user):
    """
    Crea un evento de tipo UserCreated
    Lo guarda en el Event Store y lo publica a RabbitMQ
    """
    event_data = {
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "email": user.email,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # 1. Guardar en Event Store (Event Sourcing)
    event_store.append_event(
        aggregate_id=user.id,
        event_type="UserCreated",
        data=event_data
    )
    
    # 2. Publicar a RabbitMQ (opcional, si está disponible)
    publish_event("user.created", event_data)
    
    return event_data