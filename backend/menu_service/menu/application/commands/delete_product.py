"""
Command: Delete Product
CQRS - Command para eliminar un producto usando Command pattern
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from .base_command import Command, CommandHandler
from menu.application.ports.product_repository_port import ProductRepositoryPort
from menu.application.ports.event_publisher_port import EventPublisherPort
from menu.domain.exceptions import ProductNotFoundException
from menu.domain.shared.domain_event import DomainEvent


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
        event_publisher: EventPublisherPort
    ):
        self.product_repo = product_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: DeleteProductCommand) -> bool:
        """Execute the command - deletes a product"""
        
        # Validaciones
        if not command.product_id:
            raise ValueError("Se requiere product_id")
        
        if not command.restaurant_id:
            raise ValueError("Se requiere restaurant_id")
        
        # Verificar si existe y obtener datos para el evento
        product = self.product_repo.get_by_id(command.product_id, command.restaurant_id)
        if not product:
            raise ProductNotFoundException(command.product_id)
        
        product_name = product.name
        
        # Eliminar
        deleted = self.product_repo.delete(command.product_id, command.restaurant_id)
        
        # Publicar evento de dominio
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