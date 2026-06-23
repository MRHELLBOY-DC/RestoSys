from dataclasses import dataclass
from typing import Optional, Any
from users.domain.entities.restaurant import Restaurant as DomainRestaurant
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.ports.event_publisher_port import EventPublisherPort
from users.domain.exceptions import InvalidRestaurantNameException
from .base_command import Command, CommandHandler

@dataclass
class CreateRestaurantCommand(Command):
    name: str
    address: str
    logo: Optional[Any] = None  # Permitimos archivo o string
    actor_username: Optional[str] = None

class CreateRestaurantCommandHandler(CommandHandler):
    
    def __init__(
        self,
        restaurant_repo: RestaurantRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.restaurant_repo = restaurant_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: CreateRestaurantCommand) -> DomainRestaurant:
        
        # 1. Validación de negocio
        if not command.name or len(command.name.strip()) < 3:
            raise InvalidRestaurantNameException(command.name, "debe tener al menos 3 caracteres")
        
        # 2. Selección del método de persistencia
        # Si 'logo' tiene método 'read', asumimos que es un archivo subido (UploadedFile)
        is_file = hasattr(command.logo, 'read')
        
        if is_file:
            saved = self.restaurant_repo.create_with_logo(
                name=command.name,
                address=command.address,
                logo_file=command.logo,
                actor_username=command.actor_username
            )
        else:
            # Flujo para URL string o None
            restaurant = DomainRestaurant(
                id=None, 
                name=command.name, 
                address=command.address, 
                logo=command.logo
            )
            saved = self.restaurant_repo.save(restaurant)
        
        # 3. Publicación de eventos de dominio
        saved.record_created(command.actor_username)
        events = saved.pull_domain_events()
        
        for event in events:
            try:
                self.event_publisher.persist_and_publish(event, 'restaurant.created')
            except Exception as e:
                print(f"ERROR al publicar evento: {e}")
        
        return saved