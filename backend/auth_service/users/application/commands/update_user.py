"""
Command: Update User
CQRS - Command para actualizar usuario
"""
from datetime import datetime
from users.infrastructure.event_store import event_store
from shared import publish_event, USER_UPDATED


def update_user_event(user, old_data, new_data):
    """
    Crea un evento de tipo UserUpdated
    Guarda el estado anterior y el nuevo para trazabilidad
    """
    event_data = {
        'user_id': user.id,
        'username': user.username,
        'old_data': old_data,
        'new_data': new_data,
        'timestamp': datetime.utcnow().isoformat()
    }
    event_store.append_event(
        aggregate_id=user.id,
        event_type='UserUpdated',
        data=event_data
    )
    publish_event(USER_UPDATED, event_data)
    return event_data