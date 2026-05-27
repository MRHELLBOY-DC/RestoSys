"""
Query: Get User Details
CQRS - Query para obtener detalles de un usuario específico
"""
from users.infrastructure.repositories import UserRepository, UserRestaurant, Restaurant


def get_user_details(user_id):
    """
    Retorna detalles completos de un usuario por ID
    Incluye información de restaurantes asociados
    """
    user = UserRepository.get_active_user_by_id(user_id)
    if user is None:
        return None

    user_restaurants = UserRestaurant.objects.filter(user=user).select_related('restaurant')
    restaurants = [
        {
            'id': ur.restaurant.id,
            'name': ur.restaurant.name,
            'address': ur.restaurant.address
        }
        for ur in user_restaurants
    ]

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'date_joined': user.date_joined.isoformat(),
        'last_login': user.last_login.isoformat() if user.last_login else None,
        'restaurants': restaurants
    }
