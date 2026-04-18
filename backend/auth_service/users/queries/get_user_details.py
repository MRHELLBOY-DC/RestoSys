"""
Query: Get User Details
CQRS - Query para obtener detalles de un usuario específico
"""
from users.models import User, UserRestaurant, Restaurant


def get_user_details(user_id):
    """
    Retorna detalles completos de un usuario
    Incluye información de restaurantes asociados
    """
    try:
        user = User.objects.get(id=user_id, is_active=True)
        
        # Obtener restaurantes asociados
        user_restaurants = UserRestaurant.objects.filter(
            user=user
        ).select_related('restaurant')
        
        restaurants = [
            {
                "id": ur.restaurant.id,
                "name": ur.restaurant.name,
                "address": ur.restaurant.address
            }
            for ur in user_restaurants
        ]
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "date_joined": user.date_joined.isoformat(),
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "restaurants": restaurants
        }
    except User.DoesNotExist:
        return None


def get_user_by_username(username):
    """
    Retorna usuario por username (sin datos sensibles)
    """
    try:
        user = User.objects.get(username=username, is_active=True)
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    except User.DoesNotExist:
        return None