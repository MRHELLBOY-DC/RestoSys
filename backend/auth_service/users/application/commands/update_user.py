from dataclasses import dataclass
from typing import Optional, Dict, Any
from users.domain.entities.user import User as DomainUser
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.event_publisher_port import EventPublisherPort
from users.domain.exceptions import UserNotFoundException, UserAlreadyExistsException
from .base_command import Command, CommandHandler


@dataclass
class UpdateUserCommand(Command):
    """Command to update a user"""
    user_id: int
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None
    actor_username: Optional[str] = None


class UpdateUserCommandHandler(CommandHandler):
    """Handler for UpdateUserCommand"""
    
    def __init__(
        self,
        user_repo: UserRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.user_repo = user_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: UpdateUserCommand) -> DomainUser:
        """Execute the command - updates a user"""
        
        # 1. Obtener usuario existente
        existing_user = self.user_repo.get_by_id(command.user_id)
        if not existing_user:
            raise UserNotFoundException(command.user_id)
        
        # 2. Guardar datos viejos para el evento
        old_data = {
            'username': existing_user.username,
            'email': existing_user.email,
            'role': existing_user.role,
        }
        
        # 3. Validar unicidad si cambia email (regla que necesita repositorio)
        if command.email and command.email != existing_user.email:
            if self.user_repo.get_by_email(command.email):
                raise UserAlreadyExistsException("email", command.email)

            existing_user.email = command.email
        
        # 4. Validar unicidad si cambia username (regla que necesita repositorio)
        if command.username and command.username != existing_user.username:
            if self.user_repo.get_by_username(command.username):
                raise UserAlreadyExistsException("username", command.username)

            existing_user.username = command.username
        
        # 5. Actualizar otros campos
        if command.role:
            existing_user.role = command.role
        if command.full_name is not None:
            existing_user.full_name = command.full_name

        existing_user._validate()
        
        # 6. Guardar cambios
        saved_user = self.user_repo.save(existing_user)
        
        # 7. Datos nuevos para el evento
        new_data = {
            'username': saved_user.username,
            'email': saved_user.email,
            'role': saved_user.role,
        }
        
        # 8. Registrar evento de actualización
        saved_user.record_updated(old_data, new_data)
        events = saved_user.pull_domain_events()
        event = events[-1]
        if command.actor_username:
            event.data['actor_username'] = command.actor_username
        self.event_publisher.persist_and_publish(event, "UserUpdated")
        
        return saved_user