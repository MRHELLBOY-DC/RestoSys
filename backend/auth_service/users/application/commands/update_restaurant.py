from dataclasses import dataclass
from typing import Optional, Any
from users.domain.entities.restaurant import Restaurant as DomainRestaurant
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.ports.event_publisher_port import EventPublisherPort
from users.domain.exceptions import RestaurantNotFoundException, InvalidRestaurantNameException
from .base_command import Command, CommandHandler
from django.core.files.uploadedfile import UploadedFile


@dataclass
class UpdateRestaurantCommand(Command):
    """Command to update an existing restaurant"""
    restaurant_id: int
    name: Optional[str] = None
    address: Optional[str] = None
    logo: Optional[Any] = None  # Puede ser un archivo o una URL string
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
        
        # 3. Validar nombre (si se proporciona)
        name_to_update = command.name if command.name is not None else restaurant.name
        if len(name_to_update.strip()) < 3:
            raise InvalidRestaurantNameException(name_to_update, "debe tener al menos 3 caracteres")
        
        # 4. Llamar al repositorio usando el método especializado en archivos
        # Delegamos la lógica de persistencia al repo
        saved = self.restaurant_repo.update_with_logo(
            restaurant_id=command.restaurant_id,
            name=name_to_update,
            address=command.address if command.address is not None else restaurant.address,
            logo_file=command.logo,
            actor_username=command.actor_username or ""
        )
        
        # 5. Publicar evento de actualización
        # Nota: Aseguramos que la entidad refleje los cambios guardados
        saved.record_updated(old_data, command.actor_username)
        events = saved.pull_domain_events()
        for event in events:
            self.event_publisher.persist_and_publish(event, 'restaurant.updated')
        
        return saved