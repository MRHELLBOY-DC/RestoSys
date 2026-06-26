from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import datetime

from users.domain.entities.user import User as DomainUser
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.authentication_port import AuthenticationPort
from users.application.ports.event_publisher_port import EventPublisherPort
from users.domain.shared import DomainEvent
from users.domain.exceptions import InvalidCredentialsException
from users.application.queries.get_restaurant_queries import GetUserRestaurantQuery
from .base_command import Command, CommandHandler


@dataclass
class LoginCommand(Command):
    """Command to authenticate a user and generate tokens"""
    email: Optional[str] = None
    username: Optional[str] = None
    password: str = ""


class LoginCommandHandler(CommandHandler):
    """Handler for LoginCommand"""
    
    def __init__(
        self,
        user_repo: UserRepositoryPort,
        auth_service: AuthenticationPort,
        event_publisher: EventPublisherPort,
        query_bus
    ):
        self.user_repo = user_repo
        self.auth_service = auth_service
        self.event_publisher = event_publisher
        self.query_bus = query_bus
    
    def handle(self, command: LoginCommand) -> Dict[str, Any]:
        """Execute the command - authenticates user and returns tokens"""
        
        identifier = command.email or command.username or 'unknown'
        
        # 1. Buscar usuario
        user_lookup = None
        if command.email:
            user_lookup = self.user_repo.get_by_email(command.email)
        elif command.username:
            user_lookup = self.user_repo.get_by_username(command.username)
        
        if not user_lookup:
            self._publish_failed_event(identifier)
            raise InvalidCredentialsException()
        
        # 2. Autenticar
        auth_result = self.auth_service.authenticate(
            username=user_lookup.username,
            password=command.password
        )
        
        if not auth_result.get('success'):
            self._publish_failed_event(identifier)
            raise InvalidCredentialsException()
        
        user = auth_result['user']
        
        # 3. Actualizar last_login
        from django.utils import timezone
        user.last_login = timezone.now()
        self.user_repo.save(user)
        
        # 4. Publicar evento
        event = DomainEvent(
            event_type='auth.login.success',
            aggregate_id=str(user.id),
            aggregate_type='User',
            data={
                'user_id': user.id,
                'username': user.username,
                'role': user.role,
                'timestamp': datetime.utcnow().isoformat(),
            },
            occurred_at=datetime.utcnow().isoformat()
        )
        self.event_publisher.persist_and_publish(event, 'auth.login.success')
        
        # 5. Generar tokens
        tokens = self.auth_service.generate_tokens(user)
        
        # 6. Obtener restaurante usando query_bus (inyectado)
        from users.application.queries.get_restaurant_queries import GetUserRestaurantQuery
        query = GetUserRestaurantQuery(user_id=user.id)
        restaurant_dto = self.query_bus.execute(query)
        
        restaurant_id = restaurant_dto.id if restaurant_dto else None
        restaurant_data = restaurant_dto.to_dict() if restaurant_dto else None
        
        return {
            'success': True,
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': {
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'role': user.role,
                'restaurant': restaurant_data,
                'restaurant_id': restaurant_id,
            },
        }
    
    def _publish_failed_event(self, identifier: str) -> None:
        event = DomainEvent(
            event_type='auth.login.failed',
            aggregate_id=None,
            aggregate_type='User',
            data={
                'identifier': identifier,
                'timestamp': datetime.utcnow().isoformat(),
            },
            occurred_at=datetime.utcnow().isoformat()
        )
        self.event_publisher.persist_and_publish(event, 'auth.login.failed')