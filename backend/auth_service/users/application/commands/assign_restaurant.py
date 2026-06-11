from dataclasses import dataclass
from typing import Optional
from users.domain.entities.user_restaurant import UserRestaurant
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort
from users.domain.exceptions import UserNotFoundException, RestaurantNotFoundException, UserRestaurantAssignmentException
from .base_command import Command, CommandHandler


@dataclass
class AssignRestaurantCommand(Command):
    user_id: int
    restaurant_id: int
    actor_username: Optional[str] = None


class AssignRestaurantCommandHandler(CommandHandler):
    
    def __init__(
        self,
        user_repo: UserRepositoryPort,
        restaurant_repo: RestaurantRepositoryPort,
        user_restaurant_repo: UserRestaurantRepositoryPort
    ):
        self.user_repo = user_repo
        self.restaurant_repo = restaurant_repo
        self.user_restaurant_repo = user_restaurant_repo
    
    def handle(self, command: AssignRestaurantCommand) -> UserRestaurant:
        
        # 1. Validar que el usuario existe
        user = self.user_repo.get_by_id(command.user_id)
        if not user:
            raise UserNotFoundException(command.user_id)
        
        # 2. Validar que el restaurante existe
        restaurant = self.restaurant_repo.get_by_id(command.restaurant_id)
        if not restaurant:
            raise RestaurantNotFoundException(command.restaurant_id)
        
        # 3. Asignar restaurante al usuario
        try:
            return self.user_restaurant_repo.assign(command.user_id, command.restaurant_id)
        except Exception as e:
            raise UserRestaurantAssignmentException(command.user_id, command.restaurant_id, str(e))