"""
Command: Update Category
CQRS - Command para actualizar una categoría
"""
from datetime import datetime
from ...infrastructure.repositories import CategoryRepository
from ...infrastructure.event_store import event_store
from ...domain.entities import Category
from shared import publish_event


def update_category_command(category_id: int, name: str, restaurant_id: int, actor_username: str = None) -> Category:
    """
    Actualiza una categoría existente
    """
    # Validaciones
    if not category_id:
        raise ValueError("Se requiere category_id")
    
    if not name or not name.strip():
        raise ValueError("El nombre de la categoría es requerido")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    # Obtener datos antiguos
    old_category = CategoryRepository.get_by_id(category_id, restaurant_id)
    if not old_category:
        raise ValueError(f"Categoría con id {category_id} no encontrada")
    
    old_data = {
        'name': old_category.name,
    }
    
    # Actualizar categoría
    category = CategoryRepository.update(
        category_id=category_id,
        restaurant_id=restaurant_id,
        name=name.strip()
    )
    
    # Guardar evento en Event Store
    event_data = {
        'category_id': category.id,
        'name': category.name,
        'restaurant_id': restaurant_id,
        'old_data': old_data,
        'new_data': {'name': name.strip()},
        'timestamp': datetime.utcnow().isoformat()
    }
    event_store.append_event(
        aggregate_id=category.id,
        event_type='CategoryUpdated',
        data=event_data,
        aggregate_type='Category'
    )
    
    if actor_username:
        event_data['actor_username'] = actor_username

    # Publicar evento a RabbitMQ
    publish_event('category.updated', event_data)
    
    return category