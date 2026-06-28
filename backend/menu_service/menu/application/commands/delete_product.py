"""
Command: Delete Product
CQRS - Command para eliminar un producto usando Command pattern
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from .base_command import Command, CommandHandler
from menu.application.ports.product_repository_port import ProductRepositoryPort
from menu.application.ports.option_repository_port import OptionRepositoryPort
from menu.application.ports.event_publisher_port import EventPublisherPort
from menu.domain.exceptions import ProductNotFoundException, ProductHasOptionsException
from menu.domain.shared import DomainEvent


@dataclass
class DeleteProductCommand(Command):
    """Command to delete a product"""
    product_id: int
    restaurant_id: int
    actor_username: Optional[str] = None


class DeleteProductCommandHandler(CommandHandler):
    """Handler for DeleteProductCommand"""
    
    def __init__(
        self,
        product_repo: ProductRepositoryPort,
        option_repo: OptionRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.product_repo = product_repo
        self.option_repo = option_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: DeleteProductCommand) -> bool:
        """Execute the command - deletes a product"""
        
        # Validaciones básicas
        if not command.product_id:
            raise ValueError("Se requiere product_id")
        
        if not command.restaurant_id:
            raise ValueError("Se requiere restaurant_id")
        
        # 1. Verificar si el producto existe
        product = self.product_repo.get_by_id(command.product_id, command.restaurant_id)
        if not product:
            raise ProductNotFoundException(command.product_id)
        
        # 2. REGLA DE NEGOCIO: Verificar que el producto no tenga opciones asociadas
        option_count = self.option_repo.count_by_product(command.product_id, command.restaurant_id)
        if option_count > 0:
            raise ProductHasOptionsException(command.product_id, option_count)
        
        product_name = product.name
        
        # 3. Eliminar producto
        deleted = self.product_repo.delete(command.product_id, command.restaurant_id)
        
        # 4. Publicar evento de dominio
        if deleted:
            event_data = {
                'product_id': command.product_id,
                'name': product_name,
                'restaurant_id': command.restaurant_id,
            }
            if command.actor_username:
                event_data['actor_username'] = command.actor_username
            
            event = DomainEvent(
                event_type='ProductDeleted',
                aggregate_id=str(command.product_id),
                aggregate_type='Product',
                data=event_data,
                occurred_at=datetime.utcnow().isoformat()
            )
            
            self.event_publisher.persist_and_publish(event, 'product.deleted')
        
        return deleted