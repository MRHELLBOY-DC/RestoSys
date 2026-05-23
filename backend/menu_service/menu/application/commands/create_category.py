"""
Command: Create Category
CQRS - Command para crear una categoría
"""
from ...infrastructure.repositories import CategoryRepository
from ...infrastructure.event_store import event_store
from ...domain.entities import Category
from shared import publish_event


def _persist_and_publish(event, routing_key):
    event_data = {
        **event.data,
        'timestamp': event.occurred_at,
    }
    event_store.append_event(
        aggregate_id=event.aggregate_id,
        event_type=event.event_type,
        data=event_data,
        aggregate_type=event.aggregate_type
    )
    publish_event(routing_key, event_data)
    return event_data


def create_category_command(name: str, restaurant_id: int) -> Category:
    """
    Crea una nueva categoría
    """
    # Validaciones
    if not name or not name.strip():
        raise ValueError("El nombre de la categoría es requerido")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    # Crear categoría
    category = CategoryRepository.create(
        name=name.strip(),
        restaurant_id=restaurant_id
    )
    
    category.record_created()
    event = category.pull_domain_events()[-1]
    _persist_and_publish(event, 'category.created')
    
    return category
