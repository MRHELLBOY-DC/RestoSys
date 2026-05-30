"""
Command: Create Option
CQRS - Command para crear una opción de producto
"""
from decimal import Decimal
from ...infrastructure.repositories import ProductOptionRepository, ProductRepository
from ...domain.entities import ProductOption
from menu.application.ports.event_publisher_port import EventPublisherPort


def create_option_command(
    name: str,
    extra_price: Decimal,
    product_id: int,
    restaurant_id: int,
    event_publisher: EventPublisherPort,
    actor_username: str = None
) -> ProductOption:
    """
    Crea una nueva opción para un producto
    """
    if not name or not name.strip():
        raise ValueError("El nombre de la opción es requerido")
    
    if extra_price is None or extra_price < 0:
        raise ValueError("El precio extra no puede ser negativo")
    
    if not product_id:
        raise ValueError("Se requiere product_id")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    product = ProductRepository.get_by_id(product_id, restaurant_id)
    if not product:
        raise ValueError(f"Producto con id {product_id} no encontrado en este restaurante")
    
    option = ProductOptionRepository.create(
        name=name.strip(),
        extra_price=extra_price,
        product_id=product_id
    )
    
    option.record_created(product_name=product.name, restaurant_id=restaurant_id)
    event = option.pull_domain_events()[-1]
    if actor_username:
        event.data['actor_username'] = actor_username
    event_publisher.persist_and_publish(event, 'option.created')
    
    return option