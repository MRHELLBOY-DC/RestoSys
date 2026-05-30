"""
Command: Delete Category
CQRS - Command para eliminar una categoría
"""
from datetime import datetime
from ...infrastructure.repositories import CategoryRepository
from ...infrastructure.event_store import event_store
from shared import publish_event


def delete_category_command(category_id: int, restaurant_id: int, actor_username: str = None) -> bool:
    """
    Elimina una categoría
    """
    # Validaciones
    if not category_id:
        raise ValueError("Se requiere category_id")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    # Verificar si existe
    category = CategoryRepository.get_by_id(category_id, restaurant_id)
    if not category:
        raise ValueError(f"Categoría con id {category_id} no encontrada")
    
    # Eliminar
    deleted = CategoryRepository.delete(category_id, restaurant_id)
    
    # Guardar evento en Event Store
    if deleted:
        event_data = {
            'category_id': category_id,
            'name': category.name,
            'restaurant_id': restaurant_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        event_store.append_event(
            aggregate_id=category_id,
            event_type='CategoryDeleted',
            data=event_data,
            aggregate_type='Category'
        )
        
        if actor_username:
            event_data['actor_username'] = actor_username

        # Publicar evento a RabbitMQ
        publish_event('category.deleted', event_data)
    
    return deleted