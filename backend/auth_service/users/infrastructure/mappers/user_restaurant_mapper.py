from typing import Optional
from users.domain.entities.user_restaurant import UserRestaurant as DomainUserRestaurant
from users.infrastructure.models import UserRestaurant as DjangoUserRestaurant
from users.domain.exceptions import UserRestaurantException
from .base_mapper import BaseMapper


class UserRestaurantMapper(BaseMapper[DomainUserRestaurant, DjangoUserRestaurant]):
    """Mapper para UserRestaurant entre dominio y Django"""
    
    @staticmethod
    def to_domain(django_ur: Optional[DjangoUserRestaurant]) -> DomainUserRestaurant:
        """Convierte modelo Django a entidad de dominio"""
        if django_ur is None:
            raise UserRestaurantException("Relación usuario-restaurante no encontrada")
        return DomainUserRestaurant(
            id=django_ur.id,
            user_id=django_ur.user_id,
            restaurant_id=django_ur.restaurant_id,
        )
    
    @staticmethod
    def to_persistence(domain_ur: DomainUserRestaurant) -> DjangoUserRestaurant:
        """Convierte entidad de dominio a modelo Django"""
        if domain_ur is None:
            raise ValueError("No se puede convertir una relación None a Django")
        return DjangoUserRestaurant(
            id=domain_ur.id,
            user_id=domain_ur.user_id,
            restaurant_id=domain_ur.restaurant_id,
        )