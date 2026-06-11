"""
Command: Create Category
CQRS - Command para crear una categoría usando Command pattern
"""
from dataclasses import dataclass
from typing import Optional
from .base_command import Command, CommandHandler
from menu.application.ports.category_repository_port import CategoryRepositoryPort
from menu.application.ports.event_publisher_port import EventPublisherPort
from menu.domain.entities.category import Category
from menu.domain.exceptions import InvalidCategoryNameException


@dataclass
class CreateCategoryCommand(Command):
    """Command to create a category"""
    name: str
    restaurant_id: int
    actor_username: Optional[str] = None


class CreateCategoryCommandHandler(CommandHandler):
    """Handler for CreateCategoryCommand"""
    
    def __init__(
        self,
        category_repo: CategoryRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.category_repo = category_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: CreateCategoryCommand) -> Category:
        """Execute the command - creates a new category"""
        
        # La validación ahora está en la entidad
        try:
            category_entity = Category(
                name=command.name.strip() if command.name else None,
                restaurant_id=command.restaurant_id
            )
        except InvalidCategoryNameException as e:
            raise e
        
        # Crear categoría usando repositorio
        category = self.category_repo.create(
            name=category_entity.name,
            restaurant_id=category_entity.restaurant_id
        )
        
        # Registrar evento de dominio
        category.record_created()
        events = category.pull_domain_events()
        
        # Publicar eventos
        for event in events:
            if command.actor_username:
                event.data['actor_username'] = command.actor_username
            self.event_publisher.persist_and_publish(event, 'category.created')
        
        return category