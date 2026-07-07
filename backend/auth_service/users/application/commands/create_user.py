from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import datetime
from users.domain.entities.user import User as DomainUser
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort
from users.application.ports.event_publisher_port import EventPublisherPort
from users.application.ports.hashing_port import HashingPort
from users.domain.exceptions import (
    UserAlreadyExistsException,
    RestaurantNotFoundException,
    InsufficientPermissionsException,
)
from .base_command import Command, CommandHandler

ROLES_ASIGNABLES_POR_RESTAURANTE = ('empleado', 'repartidor')


@dataclass
class CreateUserCommand(Command):
    """Command to create a user"""
    email: str
    password: str
    username: Optional[str] = None
    role: str = "cliente"
    full_name: str = ""
    actor_username: Optional[str] = None
    assign_restaurant_id: Optional[int] = None


class CreateUserCommandHandler(CommandHandler):
    """Handler for CreateUserCommand"""
    
    def __init__(
        self,
        user_repo: UserRepositoryPort,
        user_restaurant_repo: UserRestaurantRepositoryPort,
        event_publisher: EventPublisherPort,
        hashing_service: HashingPort
    ):
        self.user_repo = user_repo
        self.user_restaurant_repo = user_restaurant_repo
        self.event_publisher = event_publisher
        self.hashing_service = hashing_service
    
    def handle(self, command: CreateUserCommand) -> DomainUser:
        """Execute the command - creates a new user"""

        # 0. Un Admin Restaurante solo puede crear empleados/repartidores de su propio restaurante
        actor = self.user_repo.get_by_username(command.actor_username) if command.actor_username else None
        assign_restaurant_id = command.assign_restaurant_id
        if actor and actor.is_restaurante():
            if command.role not in ROLES_ASIGNABLES_POR_RESTAURANTE:
                raise InsufficientPermissionsException(actor.id, 'empleado o repartidor')
            actor_restaurant = self.user_restaurant_repo.get_by_user_id(actor.id)
            if not actor_restaurant:
                raise RestaurantNotFoundException(actor.id)
            assign_restaurant_id = actor_restaurant.restaurant_id

        # 0.1 Validar que el restaurante a asignar exista ANTES de crear el usuario
        # (evita dejar un usuario huerfano si el restaurante no existe)
        if assign_restaurant_id:
            from users.infrastructure.repositories import RestaurantRepository
            restaurant_repo = RestaurantRepository()
            if not restaurant_repo.get_by_id(assign_restaurant_id):
                raise RestaurantNotFoundException(assign_restaurant_id)

        # 1. Validar unicidad (regla que necesita repositorio)
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
        
        # 3. Crear entidad de dominio (LA ENTIDAD VALIDA SUS REGLAS)
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
        
        # 5. Asignar restaurante si se proporcionó (ya validado que existe)
        if assign_restaurant_id:
            self.user_restaurant_repo.assign(saved_user.id, assign_restaurant_id)
        
        # 6. Registrar evento de creación
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