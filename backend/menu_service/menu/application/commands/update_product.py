"""
Command: Update Product
CQRS - Command para actualizar un producto
"""
from datetime import datetime
from decimal import Decimal
from ...infrastructure.repositories import ProductRepository, CategoryRepository
from ...infrastructure.event_store import event_store
from ...domain.entities import Product
from shared import publish_event


def update_product_command(
    product_id: int,
    restaurant_id: int,
    name: str = None,
    price = None,
    category_id: int = None,
    image = None,
    description: str = None,
    actor_username: str = None
) -> Product:
    """
    Actualiza un producto existente
    """
    # Validaciones
    if not product_id:
        raise ValueError("Se requiere product_id")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    # Obtener datos antiguos
    existing_product = ProductRepository.get_by_id(product_id, restaurant_id)
    if not existing_product:
        raise ValueError(f"Producto con id {product_id} no encontrado")
    
    old_data = {
        'name': existing_product.name,
        'price': str(existing_product.price),
        'category_id': existing_product.category_id,
        'image': existing_product.image,
        'description': existing_product.description,
    }
    
    # Verificar categoría si se está actualizando
    if category_id and category_id != existing_product.category_id:
        category = CategoryRepository.get_by_id(category_id, restaurant_id)
        if not category:
            raise ValueError(f"Categoría con id {category_id} no encontrada en este restaurante")
    
    # Construir datos a actualizar
    update_data = {}
    if name is not None:
        update_data['name'] = name.strip()
    if price is not None:
        if isinstance(price, str):
            price = Decimal(price)
        elif isinstance(price, (int, float)):
            price = Decimal(str(price))
        if price <= 0:
            raise ValueError("El precio debe ser mayor a 0")
        update_data['price'] = price
    if category_id is not None:
        update_data['category_id'] = category_id
    if description is not None:
        update_data['description'] = description
    
    # Actualizar producto (con o sin imagen)
    if image is not None and hasattr(image, 'name'):  # Es un archivo subido
        product = ProductRepository.update_with_image(
            product_id=product_id,
            restaurant_id=restaurant_id,
            image_file=image,
            **update_data
        )
    else:
        if image is not None and isinstance(image, str):
            update_data['image'] = image
        product = ProductRepository.update(product_id, restaurant_id, **update_data)
    
    # Guardar evento en Event Store
    if product:
        # Obtener la ruta final de la imagen
        final_image = getattr(product, 'image', None)
        
        # Limpiar datos para el evento (asegurar que todo sea serializable)
        new_data = {
            'name': name if name is not None else existing_product.name,
            'price': str(price) if price is not None else str(existing_product.price),
            'category_id': category_id if category_id is not None else existing_product.category_id,
            'image': final_image,
            'description': description if description is not None else existing_product.description,
        }
        
        event_data = {
            'product_id': product.id,
            'name': new_data.get('name', existing_product.name),
            'restaurant_id': restaurant_id,
            'old_data': old_data,
            'new_data': new_data,
            'timestamp': datetime.utcnow().isoformat()
        }
        if actor_username:
            event_data['actor_username'] = actor_username
        
        event_store.append_event(
            aggregate_id=product_id,
            event_type='ProductUpdated',
            data=event_data,
            aggregate_type='Product'
        )
        
        publish_event('product.updated', event_data)
    
    return product