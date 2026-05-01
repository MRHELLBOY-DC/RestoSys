"""
Command: Delete User
CQRS - Command para eliminar usuario (soft delete)
"""
from datetime import datetime
from users.infrastructure.event_store import event_store
from shared import publish_event, USER_DELETED


def delete_user_event(user):
    """
    Crea un evento de tipo UserDeleted
    Marca al usuario como inactivo en lugar de eliminarlo
    """
    event_data = {
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'is_active': user.is_active,
        'timestamp': datetime.utcnow().isoformat()
    }
    event_store.append_event(
        aggregate_id=user.id,
        event_type='UserDeleted',
        data=event_data
    )
    publish_event(USER_DELETED, event_data)
    return event_data