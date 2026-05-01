"""
Command: Create Product
CQRS - Command para crear un producto
"""
from datetime import datetime
from decimal import Decimal
from ...infrastructure.repositories import ProductRepository, CategoryRepository
from ...infrastructure.event_store import event_store
from ...domain.entities import Product
from shared import publish_event


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
    
    # Guardar evento en Event Store
    event_data = {
        'product_id': product.id,
        'name': product.name,
        'price': str(product.price),
        'category_id': category_id,
        'restaurant_id': restaurant_id,
        'image': product.image,
        'description': description,
        'timestamp': datetime.utcnow().isoformat()
    }
    event_store.append_event(
        aggregate_id=product.id,
        event_type='ProductCreated',
        data=event_data,
        aggregate_type='Product'
    )
    
    # Publicar evento a RabbitMQ
    publish_event('product.created', event_data)
    
    return product