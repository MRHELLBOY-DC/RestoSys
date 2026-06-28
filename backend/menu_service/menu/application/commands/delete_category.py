"""
Command: Delete Category
CQRS - Command para eliminar una categoría usando Command pattern
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from .base_command import Command, CommandHandler
from menu.application.ports.category_repository_port import CategoryRepositoryPort
from menu.application.ports.product_repository_port import ProductRepositoryPort
from menu.application.ports.event_publisher_port import EventPublisherPort
from menu.domain.exceptions import CategoryNotFoundException, CategoryHasProductsException
from menu.domain.shared import DomainEvent


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
        product_repo: ProductRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.category_repo = category_repo
        self.product_repo = product_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: DeleteCategoryCommand) -> bool:
        """Execute the command - deletes a category"""
        
        # Validaciones básicas
        if not command.category_id:
            raise ValueError("Se requiere category_id")
        
        if not command.restaurant_id:
            raise ValueError("Se requiere restaurant_id")
        
        # 1. Verificar si la categoría existe
        category = self.category_repo.get_by_id(command.category_id, command.restaurant_id)
        if not category:
            raise CategoryNotFoundException(command.category_id)
        
        # 2. REGLA DE NEGOCIO: Verificar que la categoría no tenga productos asociados
        product_count = self.product_repo.count_by_category(command.category_id, command.restaurant_id)
        if product_count > 0:
            raise CategoryHasProductsException(command.category_id, product_count)
        
        category_name = category.name
        
        # 3. Eliminar categoría
        deleted = self.category_repo.delete(command.category_id, command.restaurant_id)
        
        # 4. Publicar evento de dominio
        if deleted:
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