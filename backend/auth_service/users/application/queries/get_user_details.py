"""
Query: Get User Details
CQRS - Query para obtener detalles de un usuario específico
"""
from dataclasses import dataclass
from typing import Optional
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.dtos import UserDetailDTO
from users.domain.entities.user import User as DomainUser
from users.domain.exceptions import (
    UserNotFoundException,
    UserAccessDeniedException,
    RestaurantNotFoundException,
    RestaurantAccessDeniedException,
    InsufficientPermissionsException,
)
from .base_query import Query, QueryHandler


@dataclass
class GetUserDetailsQuery(Query):
    """Query to get user details"""
    current_user: DomainUser  # ← Usuario autenticado
    user_id: int


class GetUserDetailsQueryHandler(QueryHandler):
    """Handler for GetUserDetailsQuery"""
    
    def __init__(
        self,
        user_repo: UserRepositoryPort,
        user_restaurant_repo: UserRestaurantRepositoryPort,
        restaurant_repo: RestaurantRepositoryPort
    ):
        self.user_repo = user_repo
        self.user_restaurant_repo = user_restaurant_repo
        self.restaurant_repo = restaurant_repo
    
    def handle(self, query: GetUserDetailsQuery) -> UserDetailDTO:
        """Execute the query - obtiene detalles de un usuario con validación de permisos"""
        
        current_user = query.current_user
        target_user_id = query.user_id
        
        # ============================================
        # Obtener el usuario objetivo
        # ============================================
        target_user = self.user_repo.get_by_id(target_user_id)
        if target_user is None:
            raise UserNotFoundException(target_user_id)
        
        # ============================================
        # CASO 1: ADMIN (Super Admin) - Puede ver cualquier usuario
        # ============================================
        if current_user.is_admin():
            return self._build_user_detail_dto(target_user_id)
        
        # ============================================
        # CASO 2: CLIENTE - Solo puede verse a sí mismo
        # ============================================
        if current_user.is_cliente():
            if current_user.id != target_user_id:
                raise UserAccessDeniedException(current_user.id, target_user_id)
            return self._build_user_detail_dto(target_user_id)
        
        # ============================================
        # CASO 3: RESTAURANTE - Solo usuarios de su restaurante
        # ============================================
        if current_user.is_restaurante():
            # Obtener el restaurante del usuario actual
            current_restaurant = self.user_restaurant_repo.get_by_user_id(current_user.id)
            if not current_restaurant:
                raise RestaurantNotFoundException(current_user.id)
            
            # Obtener el restaurante del usuario objetivo
            target_restaurant = self.user_restaurant_repo.get_by_user_id(target_user_id)
            
            # Si el usuario objetivo no tiene restaurante o es de otro restaurante
            if not target_restaurant or target_restaurant.restaurant_id != current_restaurant.restaurant_id:
                raise RestaurantAccessDeniedException(current_user.id, target_user_id)
            
            return self._build_user_detail_dto(target_user_id)
        
        # ============================================
        # CASO 4: EMPLEADO - Solo usuarios de su restaurante (solo lectura)
        # ============================================
        if current_user.is_empleado():
            # Obtener el restaurante del empleado
            current_restaurant = self.user_restaurant_repo.get_by_user_id(current_user.id)
            if not current_restaurant:
                raise RestaurantNotFoundException(current_user.id)
            
            # Obtener el restaurante del usuario objetivo
            target_restaurant = self.user_restaurant_repo.get_by_user_id(target_user_id)
            
            # Si el usuario objetivo no tiene restaurante o es de otro restaurante
            if not target_restaurant or target_restaurant.restaurant_id != current_restaurant.restaurant_id:
                raise RestaurantAccessDeniedException(current_user.id, target_user_id)
            
            return self._build_user_detail_dto(target_user_id)
        
        # ============================================
        # CASO 5: ROL DESCONOCIDO - No autorizado
        # ============================================
        raise InsufficientPermissionsException(
            current_user.id,
            'admin, restaurante, empleado o cliente'
        )
    
    def _build_user_detail_dto(self, user_id: int) -> UserDetailDTO:
        """
        Construye el DTO con los detalles del usuario.
        """
        user = self.user_repo.get_by_id(user_id)
        if user is None:
            raise UserNotFoundException(user_id)
        
        user_restaurant = self.user_restaurant_repo.get_by_user_id(user_id)
        
        restaurants = []
        if user_restaurant:
            restaurant = self.restaurant_repo.get_by_id(user_restaurant.restaurant_id)
            if restaurant:
                restaurants.append({
                    'id': restaurant.id,
                    'name': restaurant.name,
                    'address': restaurant.address
                })
        
        return UserDetailDTO(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            full_name=user.full_name,
            date_joined=user.date_joined,
            last_login=user.last_login,
            restaurants=restaurants,
        )