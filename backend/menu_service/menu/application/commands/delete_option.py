"""
Command: Delete Option
CQRS - Command para eliminar una opción de producto
"""
from datetime import datetime
from ...infrastructure.repositories import ProductOptionRepository
from ...infrastructure.event_store import event_store
from shared import publish_event


def delete_option_command(option_id: int, restaurant_id: int) -> bool:
    """
    Elimina una opción de producto
    """
    # Validaciones
    if not option_id:
        raise ValueError("Se requiere option_id")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    # Verificar si existe y obtener datos
    option = ProductOptionRepository.get_by_id(option_id, restaurant_id)
    if not option:
        raise ValueError(f"Opción con id {option_id} no encontrada")
    
    # Guardar datos para el evento antes de eliminar
    option_name = option.name
    option_product_id = option.product_id
    
    # Eliminar
    deleted = ProductOptionRepository.delete(option_id, restaurant_id)
    
    # Guardar evento en Event Store
    if deleted:
        event_data = {
            'option_id': option_id,
            'name': option_name,
            'product_id': option_product_id,
            'restaurant_id': restaurant_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        event_store.append_event(
            aggregate_id=option_id,
            event_type='OptionDeleted',
            data=event_data,
            aggregate_type='ProductOption'
        )
        
        # Publicar evento a RabbitMQ
        publish_event('option.deleted', event_data)
    
    return deleted