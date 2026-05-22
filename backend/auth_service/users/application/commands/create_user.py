"""
Command: Create User
CQRS - Command para crear usuario
"""
from datetime import datetime
from users.infrastructure.event_store import event_store
from shared import publish_event, USER_CREATED


def create_user_event(user):
    """
    Crea un evento de tipo UserCreated
    Lo guarda en el Event Store y lo publica a RabbitMQ
    """
    event_data = {
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'email': user.email,
        'timestamp': datetime.utcnow().isoformat()
    }
    event_store.append_event(
        aggregate_id=user.id,
        event_type='UserCreated',
        data=event_data
    )
    publish_event(USER_CREATED, event_data)
    return event_data