from dataclasses import dataclass
from typing import Optional, Dict, Any
from users.domain.entities.user import User as DomainUser
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.event_publisher_port import EventPublisherPort
from users.domain.exceptions import UserNotFoundException
from .base_command import Command, CommandHandler


@dataclass
class DeleteUserCommand(Command):
    """Command to delete a user (soft delete)"""
    user_id: int
    actor_username: Optional[str] = None


class DeleteUserCommandHandler(CommandHandler):
    """Handler for DeleteUserCommand"""
    
    def __init__(
        self,
        user_repo: UserRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.user_repo = user_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: DeleteUserCommand) -> bool:
        """Execute the command - soft deletes a user"""
        
        # 1. Obtener usuario existente
        user = self.user_repo.get_by_id(command.user_id)
        if not user:
            raise UserNotFoundException(command.user_id)
        
        # 2. Soft delete
        user.is_active = False
        
        # 3. Guardar cambios
        self.user_repo.save(user)
        
        # 4. Registrar evento de eliminación
        user.record_deleted()
        events = user.pull_domain_events()
        event = events[-1]
        if command.actor_username:
            event.data['actor_username'] = command.actor_username
        self.event_publisher.persist_and_publish(event, "UserDeleted")
        
        return True