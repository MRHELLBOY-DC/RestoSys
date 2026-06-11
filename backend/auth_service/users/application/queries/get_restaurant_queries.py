"""
Queries para Restaurantes
"""
from dataclasses import dataclass
from typing import Optional, List
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort
from users.application.dtos import RestaurantDTO
from .base_query import Query, QueryHandler


@dataclass
class ListRestaurantsQuery(Query):
    """Query to list all restaurants"""
    pass


@dataclass
class GetUserRestaurantQuery(Query):
    """Query to get restaurant associated with a user"""
    user_id: int


class ListRestaurantsQueryHandler(QueryHandler):
    """Handler for ListRestaurantsQuery"""
    
    def __init__(self, restaurant_repo: RestaurantRepositoryPort):
        self.restaurant_repo = restaurant_repo
    
    def handle(self, query: ListRestaurantsQuery) -> List[RestaurantDTO]:
        """Execute the query"""
        restaurants = self.restaurant_repo.list_all()
        
        return [
            RestaurantDTO(
                id=r.id,
                name=r.name,
                address=r.address,
                logo=r.logo,
            )
            for r in restaurants
        ]


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
                    logo=restaurant.logo,
                )
        return None