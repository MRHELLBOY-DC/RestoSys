"""
Command: Create Option
CQRS - Command para crear una opción de producto usando Command pattern
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional
from .base_command import Command, CommandHandler
from menu.application.ports.option_repository_port import OptionRepositoryPort
from menu.application.ports.product_repository_port import ProductRepositoryPort
from menu.application.ports.event_publisher_port import EventPublisherPort
from menu.domain.entities.product_option import ProductOption
from menu.domain.exceptions import ProductNotFoundException


@dataclass
class CreateOptionCommand(Command):
    """Command to create a product option"""
    name: str
    extra_price: Decimal
    product_id: int
    restaurant_id: int
    actor_username: Optional[str] = None


class CreateOptionCommandHandler(CommandHandler):
    """Handler for CreateOptionCommand"""
    
    def __init__(
        self,
        option_repo: OptionRepositoryPort,
        product_repo: ProductRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.option_repo = option_repo
        self.product_repo = product_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: CreateOptionCommand) -> ProductOption:
        """Execute the command - creates a new product option"""
        
        # LA ENTIDAD VALIDA SUS REGLAS EN __post_init__
        option_entity = ProductOption(
            name=command.name.strip() if command.name else None,
            extra_price=command.extra_price,
            product_id=command.product_id
        )
        
        # Verificar que el producto existe
        product = self.product_repo.get_by_id(command.product_id, command.restaurant_id)
        if not product:
            raise ProductNotFoundException(command.product_id)
        
        # Crear opción
        option = self.option_repo.create(
            name=option_entity.name,
            extra_price=option_entity.extra_price,
            product_id=option_entity.product_id
        )
        
        # Registrar evento de dominio
        option.record_created(product_name=product.name, restaurant_id=command.restaurant_id)
        events = option.pull_domain_events()
        
        # Publicar eventos
        for event in events:
            if command.actor_username:
                event.data['actor_username'] = command.actor_username
            self.event_publisher.persist_and_publish(event, 'option.created')
        
        return option