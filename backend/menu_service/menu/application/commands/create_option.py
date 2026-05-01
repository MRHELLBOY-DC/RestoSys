"""
Command: Create Option
CQRS - Command para crear una opción de producto
"""
from datetime import datetime
from decimal import Decimal
from ...infrastructure.repositories import ProductOptionRepository, ProductRepository
from ...infrastructure.event_store import event_store
from ...domain.entities import ProductOption
from shared import publish_event


def create_option_command(name: str, extra_price: Decimal, product_id: int, restaurant_id: int) -> ProductOption:
    """
    Crea una nueva opción para un producto
    """
    # Validaciones
    if not name or not name.strip():
        raise ValueError("El nombre de la opción es requerido")
    
    if extra_price is None or extra_price < 0:
        raise ValueError("El precio extra no puede ser negativo")
    
    if not product_id:
        raise ValueError("Se requiere product_id")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    # Verificar que el producto existe y pertenece al restaurante
    product = ProductRepository.get_by_id(product_id, restaurant_id)
    if not product:
        raise ValueError(f"Producto con id {product_id} no encontrado en este restaurante")
    
    # Crear opción
    option = ProductOptionRepository.create(
        name=name.strip(),
        extra_price=extra_price,
        product_id=product_id
    )
    
    # Guardar evento en Event Store
    event_data = {
        'option_id': option.id,
        'name': option.name,
        'extra_price': str(option.extra_price),
        'product_id': product_id,
        'product_name': product.name,
        'restaurant_id': restaurant_id,
        'timestamp': datetime.utcnow().isoformat()
    }
    event_store.append_event(
        aggregate_id=option.id,
        event_type='OptionCreated',
        data=event_data,
        aggregate_type='ProductOption'
    )
    
    # Publicar evento a RabbitMQ
    publish_event('option.created', event_data)
    
    return option