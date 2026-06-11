"""
Query: Get User Details
CQRS - Query para obtener detalles de un usuario específico
"""
from dataclasses import dataclass
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.dtos import UserDetailDTO
from users.domain.exceptions import UserNotFoundException
from .base_query import Query, QueryHandler


@dataclass
class GetUserDetailsQuery(Query):
    """Query to get user details"""
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
        """Execute the query"""
        user = self.user_repo.get_by_id(query.user_id)
        if user is None:
            raise UserNotFoundException(query.user_id)
        
        user_restaurant = self.user_restaurant_repo.get_by_user_id(query.user_id)
        
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