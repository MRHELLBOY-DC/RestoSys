"""
Command: Delete Product
CQRS - Command para eliminar un producto
"""
from datetime import datetime
from ...infrastructure.repositories import ProductRepository
from ...infrastructure.event_store import event_store
from shared import publish_event


def delete_product_command(product_id: int, restaurant_id: int, actor_username: str = None) -> bool:
    """
    Elimina un producto
    """
    # Validaciones
    if not product_id:
        raise ValueError("Se requiere product_id")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    # Verificar si existe
    product = ProductRepository.get_by_id(product_id, restaurant_id)
    if not product:
        raise ValueError(f"Producto con id {product_id} no encontrado")
    
    # Eliminar
    deleted = ProductRepository.delete(product_id, restaurant_id)
    
    # Guardar evento en Event Store
    if deleted:
        event_data = {
            'product_id': product_id,
            'name': product.name,
            'restaurant_id': restaurant_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        if actor_username:
            event_data['actor_username'] = actor_username
        event_store.append_event(
            aggregate_id=product_id,
            event_type='ProductDeleted',
            data=event_data,
            aggregate_type='Product'
        )
        
        # Publicar evento a RabbitMQ
        publish_event('product.deleted', event_data)
    
    return deleted