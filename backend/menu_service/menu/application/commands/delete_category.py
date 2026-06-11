"""
Command: Delete Category
CQRS - Command para eliminar una categoría usando Command pattern
"""
from dataclasses import dataclass
from typing import Optional
from .base_command import Command, CommandHandler
from menu.application.ports.category_repository_port import CategoryRepositoryPort
from menu.application.ports.event_publisher_port import EventPublisherPort
from menu.domain.exceptions import CategoryNotFoundException


@dataclass
class DeleteCategoryCommand(Command):
    """Command to delete a category"""
    category_id: int
    restaurant_id: int
    actor_username: Optional[str] = None


class DeleteCategoryCommandHandler(CommandHandler):
    """Handler for DeleteCategoryCommand"""
    
    def __init__(
        self,
        category_repo: CategoryRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.category_repo = category_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: DeleteCategoryCommand) -> bool:
        """Execute the command - deletes a category"""
        
        # Validaciones
        if not command.category_id:
            raise ValueError("Se requiere category_id")
        
        if not command.restaurant_id:
            raise ValueError("Se requiere restaurant_id")
        
        # Verificar si existe y obtener datos para el evento
        category = self.category_repo.get_by_id(command.category_id, command.restaurant_id)
        if not category:
            raise CategoryNotFoundException(command.category_id)
        
        category_name = category.name
        
        # Eliminar
        deleted = self.category_repo.delete(command.category_id, command.restaurant_id)
        
        # Publicar evento de dominio
        if deleted:
            from menu.domain.shared.domain_event import DomainEvent
            from datetime import datetime
            
            event_data = {
                'category_id': command.category_id,
                'name': category_name,
                'restaurant_id': command.restaurant_id,
            }
            if command.actor_username:
                event_data['actor_username'] = command.actor_username
            
            event = DomainEvent(
                event_type='CategoryDeleted',
                aggregate_id=str(command.category_id),
                aggregate_type='Category',
                data=event_data,
                occurred_at=datetime.utcnow().isoformat()
            )
            
            self.event_publisher.persist_and_publish(event, 'category.deleted')
        
        return deleted