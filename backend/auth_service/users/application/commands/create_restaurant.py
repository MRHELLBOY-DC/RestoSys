from dataclasses import dataclass
from typing import Optional, Any
from users.domain.entities.restaurant import Restaurant as DomainRestaurant
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.ports.event_publisher_port import EventPublisherPort
from .base_command import Command, CommandHandler


@dataclass
class CreateRestaurantCommand(Command):
    name: str
    address: str
    phone: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    delivery_fee: Optional[float] = None
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
        
        # 1. Selección del método de persistencia

        is_file = hasattr(command.logo, 'read')
        
        if is_file:
            saved = self.restaurant_repo.create_with_logo(
                name=command.name,
                address=command.address,
                logo_file=command.logo,
                actor_username=command.actor_username,
                phone=command.phone,
                lat=command.lat,
                lng=command.lng,
                delivery_fee=command.delivery_fee
            )
        else:

            restaurant = DomainRestaurant(
                id=None,
                name=command.name,
                address=command.address,
                phone=command.phone,
                lat=command.lat,
                lng=command.lng,
                delivery_fee=command.delivery_fee,
                logo=command.logo
            )

            saved = self.restaurant_repo.save(restaurant)
        
        # 2. Publicación de eventos de dominio
        saved.record_created(command.actor_username)
        events = saved.pull_domain_events()
        
        for event in events:
            try:
                self.event_publisher.persist_and_publish(event, 'restaurant.created')
            except Exception as e:
                print(f"ERROR al publicar evento: {e}")
        
        return saved