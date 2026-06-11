from dataclasses import dataclass
from typing import Optional
from users.domain.entities.restaurant import Restaurant as DomainRestaurant
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.ports.event_publisher_port import EventPublisherPort
from users.domain.exceptions import RestaurantNotFoundException
from .base_command import Command, CommandHandler


@dataclass
class DeleteRestaurantCommand(Command):
    """Command to delete a restaurant"""
    restaurant_id: int
    actor_username: Optional[str] = None


class DeleteRestaurantCommandHandler(CommandHandler):
    """Handler for DeleteRestaurantCommand"""
    
    def __init__(
        self,
        restaurant_repo: RestaurantRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.restaurant_repo = restaurant_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: DeleteRestaurantCommand) -> bool:
        
        # 1. Obtener restaurante existente
        restaurant = self.restaurant_repo.get_by_id(command.restaurant_id)
        if not restaurant:
            raise RestaurantNotFoundException(command.restaurant_id)
        
        # 2. Publicar evento de eliminación antes de borrar
        restaurant.record_deleted(command.actor_username)
        events = restaurant.pull_domain_events()
        for event in events:
            self.event_publisher.persist_and_publish(event, 'restaurant.deleted')
        
        # 3. Eliminar de la base de datos
        result = self.restaurant_repo.delete(command.restaurant_id)
        
        return result