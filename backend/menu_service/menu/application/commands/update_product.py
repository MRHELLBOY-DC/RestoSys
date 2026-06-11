"""
Command: Update Product
CQRS - Command para actualizar un producto usando Command pattern
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional, Union, Any
from datetime import datetime
from .base_command import Command, CommandHandler
from menu.application.ports.product_repository_port import ProductRepositoryPort
from menu.application.ports.category_repository_port import CategoryRepositoryPort
from menu.application.ports.event_publisher_port import EventPublisherPort
from menu.domain.entities.product import Product
from menu.domain.exceptions import ProductNotFoundException, CategoryNotFoundException, InvalidProductDataException
from menu.domain.shared.domain_event import DomainEvent


@dataclass
class UpdateProductCommand(Command):
    """Command to update a product"""
    product_id: int
    restaurant_id: int
    name: Optional[str] = None
    price: Optional[Union[Decimal, str, float, int]] = None
    category_id: Optional[int] = None
    image: Optional[Any] = None
    description: Optional[str] = None
    actor_username: Optional[str] = None


class UpdateProductCommandHandler(CommandHandler):
    """Handler for UpdateProductCommand"""
    
    def __init__(
        self,
        product_repo: ProductRepositoryPort,
        category_repo: CategoryRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.product_repo = product_repo
        self.category_repo = category_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: UpdateProductCommand) -> Product:
        """Execute the command - updates a product"""
        
        # Validaciones básicas
        if not command.product_id:
            raise ValueError("Se requiere product_id")
        
        if not command.restaurant_id:
            raise ValueError("Se requiere restaurant_id")
        
        # Obtener producto existente
        existing_product = self.product_repo.get_by_id(command.product_id, command.restaurant_id)
        if not existing_product:
            raise ProductNotFoundException(command.product_id)
        
        # Guardar datos antiguos para el evento
        old_data = {
            'name': existing_product.name,
            'price': str(existing_product.price),
            'category_id': existing_product.category_id,
            'image': existing_product.image,
            'description': existing_product.description,
        }
        
        # Usar métodos de la entidad para actualizar con validaciones
        # Creamos una copia temporal para validar los cambios
        updated_entity = Product(
            name=command.name if command.name is not None else existing_product.name,
            price=Decimal(str(command.price)) if command.price is not None else existing_product.price,
            category_id=command.category_id if command.category_id is not None else existing_product.category_id,
            restaurant_id=command.restaurant_id,
            description=command.description if command.description is not None else existing_product.description,
            image=existing_product.image
        )
        
        # Verificar categoría si cambió
        if command.category_id and command.category_id != existing_product.category_id:
            category = self.category_repo.get_by_id(command.category_id, command.restaurant_id)
            if not category:
                raise CategoryNotFoundException(command.category_id)
        
        # Construir datos a actualizar
        update_data = {}
        
        if command.name is not None:
            # La validación ya ocurrió en updated_entity
            update_data['name'] = updated_entity.name
        
        if command.price is not None:
            update_data['price'] = updated_entity.price
        
        if command.category_id is not None:
            update_data['category_id'] = updated_entity.category_id
        
        if command.description is not None:
            update_data['description'] = updated_entity.description
        
        # Actualizar producto
        product = None
        image_is_file = hasattr(command.image, 'name') and hasattr(command.image, 'read')
        
        if image_is_file:
            product = self.product_repo.update_with_image(
                product_id=command.product_id,
                restaurant_id=command.restaurant_id,
                image_file=command.image,
                **update_data
            )
        else:
            if command.image is not None and isinstance(command.image, str):
                update_data['image'] = command.image
            product = self.product_repo.update(
                command.product_id,
                command.restaurant_id,
                **update_data
            )
        
        if not product:
            raise ProductNotFoundException(command.product_id)
        
        # Construir datos nuevos para el evento
        new_data = {
            'name': product.name,
            'price': str(product.price),
            'category_id': product.category_id,
            'image': product.image,
            'description': product.description,
        }
        
        # Publicar evento de dominio
        event_data = {
            'product_id': product.id,
            'restaurant_id': command.restaurant_id,
            'old_data': old_data,
            'new_data': new_data,
        }
        if command.actor_username:
            event_data['actor_username'] = command.actor_username
        
        event = DomainEvent(
            event_type='ProductUpdated',
            aggregate_id=str(command.product_id),
            aggregate_type='Product',
            data=event_data,
            occurred_at=datetime.utcnow().isoformat()
        )
        
        self.event_publisher.persist_and_publish(event, 'product.updated')
        
        return product