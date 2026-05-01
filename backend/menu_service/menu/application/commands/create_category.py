"""
Command: Create Category
CQRS - Command para crear una categoría
"""
from datetime import datetime
from ...infrastructure.repositories import CategoryRepository
from ...infrastructure.event_store import event_store
from ...domain.entities import Category
from shared import publish_event


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
    
    # Guardar evento en Event Store
    event_data = {
        'category_id': category.id,
        'name': category.name,
        'restaurant_id': restaurant_id,
        'timestamp': datetime.utcnow().isoformat()
    }
    event_store.append_event(
        aggregate_id=category.id,
        event_type='CategoryCreated',
        data=event_data,
        aggregate_type='Category'
    )
    
    # Publicar evento a RabbitMQ
    publish_event('category.created', event_data)
    
    return category