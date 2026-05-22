"""
Command: Update Option
CQRS - Command para actualizar una opción de producto
"""
from datetime import datetime
from decimal import Decimal
from ...infrastructure.repositories import ProductOptionRepository, ProductRepository
from ...infrastructure.event_store import event_store
from ...domain.entities import ProductOption
from shared import publish_event


def update_option_command(option_id: int, restaurant_id: int, name: str = None, extra_price: Decimal = None) -> ProductOption:
    """
    Actualiza una opción existente
    """
    # Validaciones
    if not option_id:
        raise ValueError("Se requiere option_id")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    # Verificar que la opción existe
    existing_option = ProductOptionRepository.get_by_id(option_id, restaurant_id)
    if not existing_option:
        raise ValueError(f"Opción con id {option_id} no encontrada")
    
    # Obtener datos antiguos
    old_data = {
        'name': existing_option.name,
        'extra_price': str(existing_option.extra_price),
    }
    
    # Construir datos a actualizar
    update_data = {}
    if name is not None:
        if not name.strip():
            raise ValueError("El nombre de la opción no puede estar vacío")
        update_data['name'] = name.strip()
    if extra_price is not None:
        if extra_price < 0:
            raise ValueError("El precio extra no puede ser negativo")
        update_data['extra_price'] = extra_price
    
    # Actualizar opción
    option = ProductOptionRepository.update(option_id, restaurant_id, **update_data)
    
    # Guardar evento en Event Store
    if option:
        event_data = {
            'option_id': option.id,
            'restaurant_id': restaurant_id,
            'product_id': option.product_id,
            'old_data': old_data,
            'new_data': update_data,
            'timestamp': datetime.utcnow().isoformat()
        }
        event_store.append_event(
            aggregate_id=option_id,
            event_type='OptionUpdated',
            data=event_data,
            aggregate_type='ProductOption'
        )
        
        # Publicar evento a RabbitMQ
        publish_event('option.updated', event_data)
    
    return option