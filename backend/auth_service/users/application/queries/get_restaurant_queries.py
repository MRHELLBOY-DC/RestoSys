"""
Queries para Restaurantes
"""
from users.infrastructure.repositories import RestaurantRepository
from users.interfaces.serializers import RestaurantSerializer


def list_all_restaurants():
    """Lista todos los restaurantes (para admin)"""
    restaurants = RestaurantRepository.list_restaurants()
    return RestaurantSerializer(restaurants, many=True).data


def get_user_restaurant_data(user):
    """Obtiene los datos del restaurante asociado a un usuario"""
    from users.domain.entities import UserRestaurant
    
    user_restaurant = UserRestaurant.objects.filter(user=user).first()
    if user_restaurant:
        return RestaurantSerializer(user_restaurant.restaurant).data
    return None