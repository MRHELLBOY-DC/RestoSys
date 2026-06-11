from dataclasses import dataclass
from typing import Optional
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort
from users.domain.exceptions import UserNotFoundException
from .base_command import Command, CommandHandler


@dataclass
class UnassignRestaurantCommand(Command):
    """Command to unassign a restaurant from a user"""
    user_id: int
    actor_username: Optional[str] = None


class UnassignRestaurantCommandHandler(CommandHandler):
    """Handler for UnassignRestaurantCommand"""
    
    def __init__(
        self,
        user_repo: UserRepositoryPort,
        user_restaurant_repo: UserRestaurantRepositoryPort
    ):
        self.user_repo = user_repo
        self.user_restaurant_repo = user_restaurant_repo
    
    def handle(self, command: UnassignRestaurantCommand) -> bool:
        """Execute the command - unassigns a restaurant from a user"""
        
        # 1. Validar que el usuario existe
        user = self.user_repo.get_by_id(command.user_id)
        if not user:
            raise UserNotFoundException(command.user_id)
        
        # 2. Desasignar restaurante del usuario
        return self.user_restaurant_repo.unassign(command.user_id)