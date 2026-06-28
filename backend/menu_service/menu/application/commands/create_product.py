"""
Command: Create Product
CQRS - Command para crear un producto usando Command pattern
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional, Union, Any
from .base_command import Command, CommandHandler
from menu.application.ports.product_repository_port import ProductRepositoryPort
from menu.application.ports.category_repository_port import CategoryRepositoryPort
from menu.application.ports.event_publisher_port import EventPublisherPort
from menu.domain.entities.product import Product
from menu.domain.exceptions import CategoryNotFoundException


@dataclass
class CreateProductCommand(Command):
    """Command to create a product"""
    name: str
    price: Union[Decimal, str, float, int]
    category_id: int
    restaurant_id: int
    image: Optional[Any] = None
    description: Optional[str] = None
    actor_username: Optional[str] = None


class CreateProductCommandHandler(CommandHandler):
    """Handler for CreateProductCommand"""
    
    def __init__(
        self,
        product_repo: ProductRepositoryPort,
        category_repo: CategoryRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.product_repo = product_repo
        self.category_repo = category_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: CreateProductCommand) -> Product:
        """Execute the command - creates a new product"""
        
        # Convertir price a Decimal
        if isinstance(command.price, str):
            price = Decimal(command.price)
        elif isinstance(command.price, (int, float)):
            price = Decimal(str(command.price))
        else:
            price = command.price
        
        # Verificar que la categoría existe
        category = self.category_repo.get_by_id(command.category_id, command.restaurant_id)
        if not category:
            raise CategoryNotFoundException(command.category_id)
        
        # LA ENTIDAD VALIDA SUS REGLAS EN __post_init__
        product_entity = Product(
            name=command.name.strip() if command.name else None,
            price=price,
            category_id=command.category_id,
            restaurant_id=command.restaurant_id,
            description=command.description
        )
        
        # Crear producto en repositorio
        product = None
        image_is_file = hasattr(command.image, 'name') and hasattr(command.image, 'read')
        
        if image_is_file:
            product = self.product_repo.create_with_image(
                name=product_entity.name,
                price=product_entity.price,
                category_id=product_entity.category_id,
                restaurant_id=product_entity.restaurant_id,
                image_file=command.image,
                description=product_entity.description
            )
        else:
            product = self.product_repo.create(
                name=product_entity.name,
                price=product_entity.price,
                category_id=product_entity.category_id,
                restaurant_id=product_entity.restaurant_id,
                image=command.image if isinstance(command.image, str) else None,
                description=product_entity.description
            )
        
        # Registrar evento de dominio
        product.record_created()
        events = product.pull_domain_events()
        
        # Publicar eventos
        for event in events:
            if command.actor_username:
                event.data['actor_username'] = command.actor_username
            if 'image' in event.data and not isinstance(event.data['image'], str):
                event.data['image'] = None
            self.event_publisher.persist_and_publish(event, 'product.created')
        
        return product