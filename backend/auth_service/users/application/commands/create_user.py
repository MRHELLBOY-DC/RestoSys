from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import datetime
from users.domain.entities.user import User as DomainUser
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.event_publisher_port import EventPublisherPort
from users.application.ports.hashing_port import HashingPort
from users.domain.exceptions import UserAlreadyExistsException
from .base_command import Command, CommandHandler


@dataclass
class CreateUserCommand(Command):
    """Command to create a user"""
    email: str
    password: str
    username: Optional[str] = None
    role: str = "cliente"
    full_name: str = ""
    actor_username: Optional[str] = None


class CreateUserCommandHandler(CommandHandler):
    """Handler for CreateUserCommand"""
    
    def __init__(
        self,
        user_repo: UserRepositoryPort,
        event_publisher: EventPublisherPort,
        hashing_service: HashingPort
    ):
        self.user_repo = user_repo
        self.event_publisher = event_publisher
        self.hashing_service = hashing_service
    
    def handle(self, command: CreateUserCommand) -> DomainUser:
        """Execute the command - creates a new user"""
        
        # 1. Validar unicidad
        if self.user_repo.get_by_email(command.email):
            raise UserAlreadyExistsException("email", command.email)
        
        # Generar username si no se proporcionó
        username = command.username
        if not username:
            username = self._generate_username_from_email(command.email)
        
        if self.user_repo.get_by_username(username):
            raise UserAlreadyExistsException("username", username)
        
        # 2. Hashear contraseña
        hashed_password = self.hashing_service.hash(command.password)
        
        # 3. Crear entidad de dominio
        domain_user = DomainUser(
            id=None,
            username=username,
            email=command.email,
            role=command.role,
            password=hashed_password,
            full_name=command.full_name,
            is_active=True,
            date_joined=datetime.now(),
            last_login=None,
        )
        
        # 4. Guardar en repositorio
        saved_user = self.user_repo.save(domain_user)
        
        # 5. Registrar evento de creación
        saved_user.record_created()
        events = saved_user.pull_domain_events()
        event = events[-1]
        if command.actor_username:
            event.data['actor_username'] = command.actor_username
        self.event_publisher.persist_and_publish(event, "UserCreated")
        
        return saved_user
    
    def _generate_username_from_email(self, email: str) -> str:
        """Genera username a partir del email"""
        username = email.split('@')[0]
        username = ''.join(ch for ch in username if ch.isalnum() or ch in ['_', '.', '-'])
        username = username[:30]
        
        if self.user_repo.get_by_username(username):
            counter = 1
            while self.user_repo.get_by_username(f"{username}{counter}"):
                counter += 1
            username = f"{username}{counter}"
        
        return username or 'user'