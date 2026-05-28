"""
Command: Create Product
CQRS - Command para crear un producto
"""
from decimal import Decimal
from ...infrastructure.repositories import ProductRepository, CategoryRepository
from ...domain.entities import Product
from menu.application.ports.event_publisher_port import EventPublisherPort


def create_product_command(
    name: str,
    price,
    category_id: int,
    restaurant_id: int,
    event_publisher: EventPublisherPort,
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
    if image is not None and hasattr(image, 'name'):
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
    event_publisher.persist_and_publish(event, 'product.created')
    
    return product