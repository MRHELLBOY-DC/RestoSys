"""
Command: Update Category
CQRS - Command para actualizar una categoría usando Command pattern
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from .base_command import Command, CommandHandler
from menu.application.ports.category_repository_port import CategoryRepositoryPort
from menu.application.ports.event_publisher_port import EventPublisherPort
from menu.domain.entities.category import Category
from menu.domain.exceptions import CategoryNotFoundException, InvalidCategoryNameException
from menu.domain.shared.domain_event import DomainEvent


@dataclass
class UpdateCategoryCommand(Command):
    """Command to update a category"""
    category_id: int
    name: str
    restaurant_id: int
    actor_username: Optional[str] = None


class UpdateCategoryCommandHandler(CommandHandler):
    """Handler for UpdateCategoryCommand"""
    
    def __init__(
        self,
        category_repo: CategoryRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.category_repo = category_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: UpdateCategoryCommand) -> Category:
        """Execute the command - updates a category"""
        
        # Validaciones básicas
        if not command.category_id:
            raise ValueError("Se requiere category_id")
        
        if not command.restaurant_id:
            raise ValueError("Se requiere restaurant_id")
        
        # Obtener datos antiguos
        old_category = self.category_repo.get_by_id(command.category_id, command.restaurant_id)
        if not old_category:
            raise CategoryNotFoundException(command.category_id)
        
        old_data = {'name': old_category.name}
        
        # Validar el nuevo nombre usando la entidad
        try:
            # Crear una entidad temporal para validar
            Category(
                name=command.name.strip(),
                restaurant_id=command.restaurant_id
            )
        except InvalidCategoryNameException as e:
            raise e
        
        # Actualizar categoría
        category = self.category_repo.update(
            category_id=command.category_id,
            restaurant_id=command.restaurant_id,
            name=command.name.strip()
        )
        
        if not category:
            raise CategoryNotFoundException(command.category_id)
        
        # Publicar evento de dominio
        event_data = {
            'category_id': category.id,
            'name': category.name,
            'restaurant_id': command.restaurant_id,
            'old_data': old_data,
            'new_data': {'name': command.name.strip()},
        }
        if command.actor_username:
            event_data['actor_username'] = command.actor_username
        
        event = DomainEvent(
            event_type='CategoryUpdated',
            aggregate_id=str(category.id),
            aggregate_type='Category',
            data=event_data,
            occurred_at=datetime.utcnow().isoformat()
        )
        
        self.event_publisher.persist_and_publish(event, 'category.updated')
        
        return category