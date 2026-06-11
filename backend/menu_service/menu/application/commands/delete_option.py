"""
Command: Delete Option
CQRS - Command para eliminar una opción de producto usando Command pattern
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from .base_command import Command, CommandHandler
from menu.application.ports.option_repository_port import OptionRepositoryPort
from menu.application.ports.event_publisher_port import EventPublisherPort
from menu.domain.exceptions import OptionNotFoundException
from menu.domain.shared.domain_event import DomainEvent


@dataclass
class DeleteOptionCommand(Command):
    """Command to delete a product option"""
    option_id: int
    restaurant_id: int
    actor_username: Optional[str] = None


class DeleteOptionCommandHandler(CommandHandler):
    """Handler for DeleteOptionCommand"""
    
    def __init__(
        self,
        option_repo: OptionRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.option_repo = option_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: DeleteOptionCommand) -> bool:
        """Execute the command - deletes a product option"""
        
        # Validaciones
        if not command.option_id:
            raise ValueError("Se requiere option_id")
        
        if not command.restaurant_id:
            raise ValueError("Se requiere restaurant_id")
        
        # Verificar si existe y obtener datos
        option = self.option_repo.get_by_id(command.option_id, command.restaurant_id)
        if not option:
            raise OptionNotFoundException(command.option_id)
        
        option_name = option.name
        option_product_id = option.product_id
        
        # Eliminar
        deleted = self.option_repo.delete(command.option_id, command.restaurant_id)
        
        # Publicar evento de dominio
        if deleted:
            event_data = {
                'option_id': command.option_id,
                'name': option_name,
                'product_id': option_product_id,
                'restaurant_id': command.restaurant_id,
            }
            if command.actor_username:
                event_data['actor_username'] = command.actor_username
            
            event = DomainEvent(
                event_type='OptionDeleted',
                aggregate_id=str(command.option_id),
                aggregate_type='ProductOption',
                data=event_data,
                occurred_at=datetime.utcnow().isoformat()
            )
            
            self.event_publisher.persist_and_publish(event, 'option.deleted')
        
        return deleted