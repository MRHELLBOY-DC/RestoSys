from dataclasses import dataclass
from typing import Optional
from users.domain.entities.restaurant import Restaurant as DomainRestaurant
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.ports.event_publisher_port import EventPublisherPort
from users.domain.exceptions import RestaurantNotFoundException, InvalidRestaurantNameException
from .base_command import Command, CommandHandler


@dataclass
class UpdateRestaurantCommand(Command):
    """Command to update an existing restaurant"""
    restaurant_id: int
    name: Optional[str] = None
    address: Optional[str] = None
    logo: Optional[str] = None
    actor_username: Optional[str] = None


class UpdateRestaurantCommandHandler(CommandHandler):
    """Handler for UpdateRestaurantCommand"""
    
    def __init__(
        self,
        restaurant_repo: RestaurantRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.restaurant_repo = restaurant_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: UpdateRestaurantCommand) -> DomainRestaurant:
        """Execute the command - updates an existing restaurant"""
        
        # 1. Obtener restaurante existente
        restaurant = self.restaurant_repo.get_by_id(command.restaurant_id)
        if not restaurant:
            raise RestaurantNotFoundException(command.restaurant_id)
        
        # 2. Guardar datos viejos para el evento
        old_data = {
            'name': restaurant.name,
            'address': restaurant.address,
            'logo': restaurant.logo,
        }
        
        # 3. Validar y actualizar nombre (si se proporciona)
        if command.name is not None:
            if len(command.name.strip()) < 3:
                raise InvalidRestaurantNameException(command.name, "debe tener al menos 3 caracteres")
            restaurant.name = command.name
        
        # 4. Actualizar otros campos (si se proporcionan)
        if command.address is not None:
            restaurant.address = command.address
        if command.logo is not None:
            restaurant.logo = command.logo
        
        # 5. Guardar cambios
        saved = self.restaurant_repo.save(restaurant)
        
        # 6. Publicar evento de actualización
        saved.record_updated(old_data, command.actor_username)
        events = saved.pull_domain_events()
        for event in events:
            self.event_publisher.persist_and_publish(event, 'restaurant.updated')
        
        return saved