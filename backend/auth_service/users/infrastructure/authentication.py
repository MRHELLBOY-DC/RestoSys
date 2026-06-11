from typing import Dict, Any, Optional
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from users.domain.entities.user import User as DomainUser
from users.application.ports.authentication_port import AuthenticationPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.infrastructure.models import User as DjangoUserModel
from users.infrastructure.mappers.user_mapper import UserMapper


class DjangoAuthenticationService(AuthenticationPort):
    """Servicio de autenticación con Django y JWT"""
    
    def __init__(
        self,
        user_restaurant_repo: Optional[UserRestaurantRepositoryPort] = None,
        restaurant_repo: Optional[RestaurantRepositoryPort] = None
    ):
        """
        Inicializa el servicio con los repositorios necesarios
        
        Args:
            user_restaurant_repo: Repositorio para relación usuario-restaurante
            restaurant_repo: Repositorio para restaurantes
        """
        self.user_restaurant_repo = user_restaurant_repo
        self.restaurant_repo = restaurant_repo
    
    def authenticate(self, username: str, password: str) -> Dict[str, Any]:
        user = authenticate(username=username, password=password)
        
        if user:
            domain_user = UserMapper.to_domain(user)
            return {'success': True, 'user': domain_user}
        
        return {'success': False, 'user': None}
    
    def generate_tokens(self, user: DomainUser) -> Dict[str, str]:
        """Genera tokens JWT incluyendo restaurant_id en el payload"""
        try:
            django_user = DjangoUserModel.objects.get(id=user.id)
            refresh = RefreshToken.for_user(django_user)
            
            # Obtener restaurant_id del usuario usando repositorios inyectados
            restaurant_id = None
            if self.user_restaurant_repo and self.restaurant_repo:
                user_restaurant = self.user_restaurant_repo.get_by_user_id(user.id)
                if user_restaurant:
                    restaurant_id = user_restaurant.restaurant_id
            
            # Agregar claims personalizados al token
            refresh.payload['user_id'] = str(user.id)
            refresh.payload['username'] = user.username
            refresh.payload['role'] = user.role
            refresh.payload['restaurant_id'] = restaurant_id
            
            return {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        except DjangoUserModel.DoesNotExist:
            raise ValueError("Usuario no encontrado para generar tokens")