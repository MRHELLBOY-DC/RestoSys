"""
Command: Create Product
CQRS - Command para crear un producto
"""
from decimal import Decimal
from ...infrastructure.repositories import ProductRepository, CategoryRepository
from ...infrastructure.event_store import event_store
from ...domain.entities import Product
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


def create_product_command(
    name: str,
    price,
    category_id: int,
    restaurant_id: int,
    image=None,
    description: str = None
) -> Product:
    """
    Crea un nuevo producto
    """
    # Validaciones
    if not name or not name.strip():
        raise ValueError("El nombre del producto es requerido")
    
    # Convertir price si es string
    if isinstance(price, str):
        price = Decimal(price)
    elif isinstance(price, (int, float)):
        price = Decimal(str(price))
    
    if not price or price <= 0:
        raise ValueError("El precio debe ser mayor a 0")
    
    if not category_id:
        raise ValueError("Se requiere category_id")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    # Verificar que la categoría existe
    category = CategoryRepository.get_by_id(category_id, restaurant_id)
    if not category:
        raise ValueError(f"Categoría con id {category_id} no encontrada en este restaurante")
    
    # Crear producto (con o sin imagen)
    if image is not None and hasattr(image, 'name'):  # Es un archivo subido
        product = ProductRepository.create_with_image(
            name=name.strip(),
            price=price,
            category_id=category_id,
            restaurant_id=restaurant_id,
            image_file=image,
            description=description
        )
    else:
        product = ProductRepository.create(
            name=name.strip(),
            price=price,
            category_id=category_id,
            restaurant_id=restaurant_id,
            image=image if isinstance(image, str) else None,
            description=description
        )
    
    product.record_created()
    event = product.pull_domain_events()[-1]
    _persist_and_publish(event, 'product.created')
    
    return product
