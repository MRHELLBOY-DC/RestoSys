from dataclasses import dataclass
from typing import Optional
from users.domain.entities.restaurant import Restaurant as DomainRestaurant
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.ports.event_publisher_port import EventPublisherPort
from users.domain.exceptions import InvalidRestaurantNameException
from .base_command import Command, CommandHandler


@dataclass
class CreateRestaurantCommand(Command):
    name: str
    address: str
    logo: Optional[str] = None
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
        
        # Validar nombre
        if not command.name or len(command.name.strip()) < 3:
            raise InvalidRestaurantNameException(command.name, "debe tener al menos 3 caracteres")
        
        # Crear entidad de dominio
        restaurant = DomainRestaurant(
            id=None,
            name=command.name,
            address=command.address,
            logo=command.logo,
        )
        
        # Guardar en repositorio
        saved = self.restaurant_repo.save(restaurant)
        
        # Publicar evento de dominio
        saved.record_created(command.actor_username)
        events = saved.pull_domain_events()
        
        print(f"DEBUG: Eventos generados = {len(events)}")  # ← Temporal
        
        for event in events:
            print(f"DEBUG: Publicando evento tipo={event.event_type} | routing_key=restaurant.created")
            try:
                self.event_publisher.persist_and_publish(event, 'restaurant.created')
                print(f"Evento publicado exitosamente: restaurant.created")
            except Exception as e:
                print(f"ERROR al publicar evento: {e}")
                import traceback
                traceback.print_exc()
        
        return saved