from typing import Optional
from users.domain.entities.restaurant import Restaurant as DomainRestaurant
from users.infrastructure.models import Restaurant as DjangoRestaurant
from users.domain.exceptions import RestaurantNotFoundException
from .base_mapper import BaseMapper


class RestaurantMapper(BaseMapper[DomainRestaurant, DjangoRestaurant]):
    """Mapper para Restaurant entre dominio y Django"""
    
    @staticmethod
    def to_domain(django_restaurant: Optional[DjangoRestaurant]) -> DomainRestaurant:
        """Convierte modelo Django a entidad de dominio"""
        if django_restaurant is None:
            raise RestaurantNotFoundException(0)
        return DomainRestaurant(
            id=django_restaurant.id,
            name=django_restaurant.name,
            address=django_restaurant.address,
            logo=django_restaurant.logo,
        )
    
    @staticmethod
    def to_persistence(domain_restaurant: DomainRestaurant) -> DjangoRestaurant:
        """Convierte entidad de dominio a modelo Django"""
        if domain_restaurant is None:
            raise ValueError("No se puede convertir un restaurante None a Django")
        return DjangoRestaurant(
            id=domain_restaurant.id,
            name=domain_restaurant.name,
            address=domain_restaurant.address,
            logo=domain_restaurant.logo,
        )