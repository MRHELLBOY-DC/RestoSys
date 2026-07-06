"""
Query: List Users
CQRS - Query para listar todos los usuarios
"""
from dataclasses import dataclass
from typing import Optional, List
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.dtos import UserListDTO
from users.domain.entities.user import User as DomainUser
from users.domain.exceptions import (
    InsufficientPermissionsException,
    RestaurantNotFoundException,
    UserNotFoundException,
)
from .base_query import Query, QueryHandler


@dataclass
class ListUsersQuery(Query):
    """Query to list users"""
    current_user: DomainUser  # ← Usuario autenticado
    role: Optional[str] = None


class ListUsersQueryHandler(QueryHandler):
    """Handler for ListUsersQuery"""
    
    def __init__(
        self,
        user_repo: UserRepositoryPort,
        user_restaurant_repo: UserRestaurantRepositoryPort,
        restaurant_repo: RestaurantRepositoryPort
    ):
        self.user_repo = user_repo
        self.user_restaurant_repo = user_restaurant_repo
        self.restaurant_repo = restaurant_repo

    def _get_restaurant_info(self, user_id: int, role: str) -> Optional[dict]:
        """Obtiene {id, name} del restaurante asignado a un usuario (si aplica)"""
        if role == 'cliente':
            return None
        user_restaurant = self.user_restaurant_repo.get_by_user_id(user_id)
        if not user_restaurant:
            return None
        restaurant = self.restaurant_repo.get_by_id(user_restaurant.restaurant_id)
        if not restaurant:
            return None
        return {'id': restaurant.id, 'name': restaurant.name}

    def handle(self, query: ListUsersQuery) -> List[UserListDTO]:
        """Execute the query - lista usuarios según permisos del usuario autenticado"""
        
        current_user = query.current_user
        
        # ============================================
        # CASO 1: ADMIN (Super Admin) - Ve todos los usuarios
        # ============================================
        if current_user.is_admin():
            users = self.user_repo.list_active(query.role)
            
            return [
                UserListDTO(
                    id=u.id,
                    username=u.username,
                    email=u.email,
                    role=u.role,
                    full_name=u.full_name,
                    date_joined=u.date_joined,
                    restaurant=self._get_restaurant_info(u.id, u.role),
                )
                for u in users
            ]
        
        # ============================================
        # CASO 2: RESTAURANTE - Ve usuarios de su restaurante
        # ============================================
        if current_user.is_restaurante():
            # Obtener el restaurante del usuario
            user_restaurant = self.user_restaurant_repo.get_by_user_id(current_user.id)
            if not user_restaurant:
                raise RestaurantNotFoundException(current_user.id)
            
            # Listar usuarios de ese restaurante
            users = self.user_repo.list_active(query.role, user_restaurant.restaurant_id)
            
            return [
                UserListDTO(
                    id=u.id,
                    username=u.username,
                    email=u.email,
                    role=u.role,
                    full_name=u.full_name,
                    date_joined=u.date_joined,
                    restaurant=self._get_restaurant_info(u.id, u.role),
                )
                for u in users
            ]
        
        # ============================================
        # CASO 3: EMPLEADO - Ve usuarios de su restaurante (solo lectura)
        # ============================================
        if current_user.is_empleado():
            # Obtener el restaurante del empleado
            user_restaurant = self.user_restaurant_repo.get_by_user_id(current_user.id)
            if not user_restaurant:
                raise RestaurantNotFoundException(current_user.id)
            
            # Listar usuarios de ese restaurante
            users = self.user_repo.list_active(restaurant_id=user_restaurant.restaurant_id)
            
            return [
                UserListDTO(
                    id=u.id,
                    username=u.username,
                    email=u.email,
                    role=u.role,
                    full_name=u.full_name,
                    date_joined=u.date_joined,
                    restaurant=self._get_restaurant_info(u.id, u.role),
                )
                for u in users
            ]
        
        # ============================================
        # CASO 4: CLIENTE - Solo ve su propio perfil
        # ============================================
        if current_user.is_cliente():
            # El cliente solo ve su propio perfil
            # Retornamos una lista con un solo elemento (sí mismo)
            user = self.user_repo.get_by_id(current_user.id)
            if not user:
                raise UserNotFoundException(current_user.id)
            
            return [
                UserListDTO(
                    id=user.id,
                    username=user.username,
                    email=user.email,
                    role=user.role,
                    full_name=user.full_name,
                    date_joined=user.date_joined,
                    restaurant=None,
                )
            ]
        
        # ============================================
        # CASO 5: ROL DESCONOCIDO - No autorizado
        # ============================================
        raise InsufficientPermissionsException(
            current_user.id,
            'admin, restaurante, empleado o cliente'
        )