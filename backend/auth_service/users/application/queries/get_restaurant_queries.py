"""
Queries para Restaurantes
"""
from dataclasses import dataclass
from typing import Optional, List
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort
from users.application.dtos import RestaurantDTO
from users.domain.entities.user import User as DomainUser
from users.domain.exceptions import (
    InsufficientPermissionsException,
    RestaurantNotFoundException,
)
from .base_query import Query, QueryHandler


@dataclass
class ListRestaurantsQuery(Query):
    """Query to list all restaurants"""
    current_user: Optional[DomainUser] = None  # ← Opcional para endpoints públicos


@dataclass
class GetUserRestaurantQuery(Query):
    """Query to get restaurant associated with a user"""
    user_id: int


class ListRestaurantsQueryHandler(QueryHandler):
    """Handler for ListRestaurantsQuery"""
    
    def __init__(self, restaurant_repo: RestaurantRepositoryPort):
        self.restaurant_repo = restaurant_repo
    
    def handle(self, query: ListRestaurantsQuery) -> List[RestaurantDTO]:
        """Execute the query - lista restaurantes según permisos del usuario"""
        
        current_user = query.current_user
        
        # ============================================
        # CASO PÚBLICO: Sin usuario autenticado - Listar todos
        # ============================================
        if current_user is None:
            restaurants = self.restaurant_repo.list_all()
            return [
                RestaurantDTO(
                    id=r.id,
                    name=r.name,
                    address=r.address,
                    phone=r.phone,
                    lat=r.lat,
                    lng=r.lng,
                    logo=r.logo,
                )
                for r in restaurants
            ]
        
        # ============================================
        # CASO 1: ADMIN (Super Admin) - Ve todos los restaurantes
        # ============================================
        if current_user.is_admin():
            restaurants = self.restaurant_repo.list_all()
            return [
                RestaurantDTO(
                    id=r.id,
                    name=r.name,
                    address=r.address,
                    phone=r.phone,
                    lat=r.lat,
                    lng=r.lng,
                    logo=r.logo,
                )
                for r in restaurants
            ]
        
        # ============================================
        # CASO 2: RESTAURANTE - Solo ve su restaurante
        # ============================================
        if current_user.is_restaurante():
            from users.infrastructure.repositories import UserRestaurantRepository
            user_restaurant_repo = UserRestaurantRepository()
            user_restaurant = user_restaurant_repo.get_by_user_id(current_user.id)
            
            if not user_restaurant:
                raise RestaurantNotFoundException(current_user.id)
            
            restaurant = self.restaurant_repo.get_by_id(user_restaurant.restaurant_id)
            if not restaurant:
                raise RestaurantNotFoundException(user_restaurant.restaurant_id)
            
            return [
                RestaurantDTO(
                    id=restaurant.id,
                    name=restaurant.name,
                    address=restaurant.address,
                    phone=restaurant.phone,
                    lat=restaurant.lat,
                    lng=restaurant.lng,
                    logo=restaurant.logo,
                )
            ]
        
        # ============================================
        # CASO 3: EMPLEADO - Solo ve el restaurante donde trabaja
        # ============================================
        if current_user.is_empleado():
            from users.infrastructure.repositories import UserRestaurantRepository
            user_restaurant_repo = UserRestaurantRepository()
            user_restaurant = user_restaurant_repo.get_by_user_id(current_user.id)
            
            if not user_restaurant:
                raise RestaurantNotFoundException(current_user.id)
            
            restaurant = self.restaurant_repo.get_by_id(user_restaurant.restaurant_id)
            if not restaurant:
                raise RestaurantNotFoundException(user_restaurant.restaurant_id)
            
            return [
                RestaurantDTO(
                    id=restaurant.id,
                    name=restaurant.name,
                    address=restaurant.address,
                    phone=restaurant.phone,
                    lat=restaurant.lat,
                    lng=restaurant.lng,
                    logo=restaurant.logo,
                )
            ]
        
        # ============================================
        # CASO 4: CLIENTE - No puede ver la lista de restaurantes
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


class GetUserRestaurantQueryHandler(QueryHandler):
    """Handler for GetUserRestaurantQuery"""
    
    def __init__(
        self,
        user_restaurant_repo: UserRestaurantRepositoryPort,
        restaurant_repo: RestaurantRepositoryPort
    ):
        self.user_restaurant_repo = user_restaurant_repo
        self.restaurant_repo = restaurant_repo
    
    def handle(self, query: GetUserRestaurantQuery) -> Optional[RestaurantDTO]:
        """Execute the query"""
        user_restaurant = self.user_restaurant_repo.get_by_user_id(query.user_id)
        
        if user_restaurant:
            restaurant = self.restaurant_repo.get_by_id(user_restaurant.restaurant_id)
            if restaurant:
                return RestaurantDTO(
                    id=restaurant.id,
                    name=restaurant.name,
                    address=restaurant.address,
                    phone=restaurant.phone,
                    lat=restaurant.lat,
                    lng=restaurant.lng,
                    logo=restaurant.logo,
                )
        return None