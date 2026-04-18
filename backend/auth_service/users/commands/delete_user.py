"""
Command: Delete User
CQRS - Command para eliminar usuario (soft delete)
"""
from datetime import datetime
from users.models import Event
from users.events import event_store, publish_event


def delete_user_event(user):
    """
    Crea un evento de tipo UserDeleted
    Marca al usuario como inactivo en lugar de eliminarlo
    """
    event_data = {
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "is_active": user.is_active,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # 1. Guardar en Event Store
    event_store.append_event(
        aggregate_id=user.id,
        event_type="UserDeleted",
        data=event_data
    )
    
    # 2. Publicar a RabbitMQ
    publish_event("user.deleted", event_data)
    
    return event_data