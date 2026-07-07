"""
Query: Get Restaurant Details
CQRS - Query para obtener detalles de un restaurante específico
"""
from dataclasses import dataclass
from typing import Optional
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort
from users.application.dtos import RestaurantDTO
from users.domain.entities.user import User as DomainUser
from users.domain.exceptions import (
    RestaurantNotFoundException,
    RestaurantAccessDeniedException,
    InsufficientPermissionsException,
)
from .base_query import Query, QueryHandler


@dataclass
class GetRestaurantDetailsQuery(Query):
    """Query to get restaurant details"""
    current_user: DomainUser
    restaurant_id: int


class GetRestaurantDetailsQueryHandler(QueryHandler):
    """Handler for GetRestaurantDetailsQuery"""
    
    def __init__(
        self,
        restaurant_repo: RestaurantRepositoryPort,
        user_restaurant_repo: UserRestaurantRepositoryPort
    ):
        self.restaurant_repo = restaurant_repo
        self.user_restaurant_repo = user_restaurant_repo
    
    def handle(self, query: GetRestaurantDetailsQuery) -> RestaurantDTO:
        """Execute the query - obtiene detalles de un restaurante con validación de permisos"""
        
        current_user = query.current_user
        restaurant_id = query.restaurant_id
        
        # ============================================
        # Obtener el restaurante
        # ============================================
        restaurant = self.restaurant_repo.get_by_id(restaurant_id)
        if restaurant is None:
            raise RestaurantNotFoundException(restaurant_id)
        
        # ============================================
        # CASO 1: ADMIN (Super Admin) - Puede ver cualquier restaurante
        # ============================================
        if current_user.is_admin():
            return RestaurantDTO(
                id=restaurant.id,
                name=restaurant.name,
                address=restaurant.address,
                phone=restaurant.phone,
                lat=restaurant.lat,
                lng=restaurant.lng,
                delivery_fee=restaurant.delivery_fee,
                logo=restaurant.logo,
            )
        
        # ============================================
        # CASO 2: RESTAURANTE - Solo puede ver su restaurante
        # ============================================
        if current_user.is_restaurante():
            user_restaurant = self.user_restaurant_repo.get_by_user_id(current_user.id)
            if not user_restaurant or user_restaurant.restaurant_id != restaurant_id:
                raise RestaurantAccessDeniedException(current_user.id, restaurant_id)
            
            return RestaurantDTO(
                id=restaurant.id,
                name=restaurant.name,
                address=restaurant.address,
                phone=restaurant.phone,
                lat=restaurant.lat,
                lng=restaurant.lng,
                delivery_fee=restaurant.delivery_fee,
                logo=restaurant.logo,
            )
        
        # ============================================
        # CASO 3: EMPLEADO - Puede ver el restaurante donde trabaja
        # ============================================
        if current_user.is_empleado():
            user_restaurant = self.user_restaurant_repo.get_by_user_id(current_user.id)
            if not user_restaurant or user_restaurant.restaurant_id != restaurant_id:
                raise RestaurantAccessDeniedException(current_user.id, restaurant_id)
            
            return RestaurantDTO(
                id=restaurant.id,
                name=restaurant.name,
                address=restaurant.address,
                phone=restaurant.phone,
                lat=restaurant.lat,
                lng=restaurant.lng,
                delivery_fee=restaurant.delivery_fee,
                logo=restaurant.logo,
            )
        
        # ============================================
        # CASO 4: CLIENTE - No puede ver detalles de restaurantes (solo pública)
        # ============================================
        if current_user.is_cliente():
            raise InsufficientPermissionsException(
                current_user.id,
                'admin, restaurante o empleado'
            )
        
        # ============================================
        # CASO 5: ROL DESCONOCIDO - No autorizado
        # ============================================
        raise InsufficientPermissionsException(
            current_user.id,
            'admin, restaurante, empleado o cliente'
        )