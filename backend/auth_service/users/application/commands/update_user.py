from dataclasses import dataclass
from typing import Optional, Dict, Any
from users.domain.entities.user import User as DomainUser
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort
from users.application.ports.event_publisher_port import EventPublisherPort
from users.domain.exceptions import (
    UserNotFoundException,
    UserAlreadyExistsException,
    RestaurantNotFoundException,
    InsufficientPermissionsException,
)
from .base_command import Command, CommandHandler

ROLES_ASIGNABLES_POR_RESTAURANTE = ('empleado', 'repartidor')


@dataclass
class UpdateUserCommand(Command):
    """Command to update a user"""
    user_id: int
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None
    actor_username: Optional[str] = None
    assign_restaurant_id: Optional[int] = None
    unassign_restaurant: bool = False


class UpdateUserCommandHandler(CommandHandler):
    """Handler for UpdateUserCommand"""
    
    def __init__(
        self,
        user_repo: UserRepositoryPort,
        user_restaurant_repo: UserRestaurantRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.user_repo = user_repo
        self.user_restaurant_repo = user_restaurant_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: UpdateUserCommand) -> DomainUser:
        """Execute the command - updates a user"""
        
        # 1. Obtener usuario existente
        existing_user = self.user_repo.get_by_id(command.user_id)
        if not existing_user:
            raise UserNotFoundException(command.user_id)

        # 1.1 Un Admin Restaurante solo puede administrar empleados/repartidores de su propio restaurante
        actor = self.user_repo.get_by_username(command.actor_username) if command.actor_username else None
        assign_restaurant_id = command.assign_restaurant_id
        unassign_restaurant = command.unassign_restaurant
        if actor and actor.is_restaurante():
            target_role = command.role or existing_user.role
            if target_role not in ROLES_ASIGNABLES_POR_RESTAURANTE:
                raise InsufficientPermissionsException(actor.id, 'empleado o repartidor')
            actor_restaurant = self.user_restaurant_repo.get_by_user_id(actor.id)
            if not actor_restaurant:
                raise RestaurantNotFoundException(actor.id)
            existing_restaurant = self.user_restaurant_repo.get_by_user_id(existing_user.id)
            if existing_restaurant and existing_restaurant.restaurant_id != actor_restaurant.restaurant_id:
                raise InsufficientPermissionsException(actor.id, 'empleado o repartidor de tu restaurante')
            assign_restaurant_id = actor_restaurant.restaurant_id
            unassign_restaurant = False

        # 1.2 Validar que el restaurante a asignar exista ANTES de guardar cambios
        # (evita dejar al usuario con datos parcialmente actualizados si el restaurante no existe)
        if not unassign_restaurant and assign_restaurant_id is not None:
            from users.infrastructure.repositories import RestaurantRepository
            restaurant_repo = RestaurantRepository()
            if not restaurant_repo.get_by_id(assign_restaurant_id):
                raise RestaurantNotFoundException(assign_restaurant_id)

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
        
        # 7. Asignar o desasignar restaurante (ya validado que existe)
        if unassign_restaurant:
            self.user_restaurant_repo.unassign(command.user_id)
        elif assign_restaurant_id is not None:
            self.user_restaurant_repo.assign(command.user_id, assign_restaurant_id)
        
        # 8. Datos nuevos para el evento
        new_data = {
            'username': saved_user.username,
            'email': saved_user.email,
            'role': saved_user.role,
        }
        
        # 9. Registrar evento de actualización
        saved_user.record_updated(old_data, new_data)
        events = saved_user.pull_domain_events()
        event = events[-1]
        if command.actor_username:
            event.data['actor_username'] = command.actor_username
        self.event_publisher.persist_and_publish(event, "UserUpdated")
        
        return saved_user