"""
Command: Update User
CQRS - Command para actualizar usuario
"""
from datetime import datetime
from users.models import Event
from users.events import event_store, publish_event


def update_user_event(user, old_data, new_data):
    """
    Crea un evento de tipo UserUpdated
    Guarda el estado anterior y el nuevo para trazabilidad
    """
    event_data = {
        "user_id": user.id,
        "username": user.username,
        "old_data": old_data,
        "new_data": new_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # 1. Guardar en Event Store
    event_store.append_event(
        aggregate_id=user.id,
        event_type="UserUpdated",
        data=event_data
    )
    
    # 2. Publicar a RabbitMQ
    publish_event("user.updated", event_data)
    
    return event_data