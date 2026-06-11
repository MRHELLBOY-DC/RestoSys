"""
Repositorios que implementan los puertos definidos en application/ports/
Usan mappers para convertir entre modelos Django y entidades de dominio puras
"""
from typing import Optional, List
from django.db import models as django_models

# Importar modelos Django REALES (desde infrastructure/models)
from users.infrastructure.models import User as DjangoUser
from users.infrastructure.models import Restaurant as DjangoRestaurant
from users.infrastructure.models import UserRestaurant as DjangoUserRestaurant
from users.infrastructure.models import Event as DjangoEvent

# Importar mappers
from users.infrastructure.mappers.user_mapper import UserMapper
from users.infrastructure.mappers.restaurant_mapper import RestaurantMapper
from users.infrastructure.mappers.user_restaurant_mapper import UserRestaurantMapper
from users.infrastructure.mappers.event_mapper import EventMapper

# Importar entidades de dominio puras
from users.domain.entities.user import User as DomainUser
from users.domain.entities.restaurant import Restaurant as DomainRestaurant
from users.domain.entities.user_restaurant import UserRestaurant as DomainUserRestaurant
from users.domain.entities.event import Event as DomainEvent

# Importar puertos DESDE APPLICATION
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.ports.restaurant_repository_port import RestaurantRepositoryPort
from users.application.ports.user_restaurant_repository_port import UserRestaurantRepositoryPort 


class UserRepository(UserRepositoryPort):
    """Implementación concreta del repositorio de usuarios"""
    
    @staticmethod
    def get_by_id(user_id: int) -> Optional[DomainUser]:
        try:
            django_user = DjangoUser.objects.get(id=user_id, is_active=True)
            return UserMapper.to_domain(django_user)
        except DjangoUser.DoesNotExist:
            return None
    
    @staticmethod
    def get_by_username(username: str) -> Optional[DomainUser]:
        try:
            django_user = DjangoUser.objects.get(username=username, is_active=True)
            return UserMapper.to_domain(django_user)
        except DjangoUser.DoesNotExist:
            return None
    
    @staticmethod
    def get_by_email(email: str) -> Optional[DomainUser]:
        try:
            django_user = DjangoUser.objects.get(email=email, is_active=True)
            return UserMapper.to_domain(django_user)
        except DjangoUser.DoesNotExist:
            return None
    
    @staticmethod
    def list_active(role: Optional[str] = None) -> List[DomainUser]:
        """Lista usuarios activos, opcionalmente filtrados por rol"""
        queryset = DjangoUser.objects.filter(is_active=True)
        if role:
            queryset = queryset.filter(role=role)
        return [UserMapper.to_domain(u) for u in queryset]
    
    @staticmethod
    def save(domain_user: DomainUser) -> DomainUser:
        if domain_user.id:
            try:
                existing = DjangoUser.objects.get(id=domain_user.id)
                # Actualizar campos manualmente (sin usar to_django_update)
                existing.username = domain_user.username
                existing.email = domain_user.email
                existing.role = domain_user.role
                existing.full_name = domain_user.full_name
                existing.is_active = domain_user.is_active
                existing.last_login = domain_user.last_login
                if domain_user.password:
                    existing.password = domain_user.password
                django_user = existing
            except DjangoUser.DoesNotExist:
                django_user = UserMapper.to_persistence(domain_user)
        else:
            django_user = UserMapper.to_persistence(domain_user)
        
        django_user.save()
        return UserMapper.to_domain(django_user)
    
    @staticmethod
    def delete(user_id: int) -> bool:
        try:
            django_user = DjangoUser.objects.get(id=user_id)
            django_user.is_active = False
            django_user.save()
            return True
        except DjangoUser.DoesNotExist:
            return False


class RestaurantRepository(RestaurantRepositoryPort):
    """Implementación concreta del repositorio de restaurantes"""
    
    @staticmethod
    def get_by_id(restaurant_id: int) -> Optional[DomainRestaurant]:
        try:
            django_restaurant = DjangoRestaurant.objects.get(id=restaurant_id)
            return RestaurantMapper.to_domain(django_restaurant)
        except DjangoRestaurant.DoesNotExist:
            return None
    
    @staticmethod
    def save(domain_restaurant: DomainRestaurant) -> DomainRestaurant:
        """Guarda un restaurante - implementa el puerto"""
        if domain_restaurant.id:
            try:
                existing = DjangoRestaurant.objects.get(id=domain_restaurant.id)
                existing.name = domain_restaurant.name
                existing.address = domain_restaurant.address
                existing.logo = domain_restaurant.logo
                django_restaurant = existing
            except DjangoRestaurant.DoesNotExist:
                django_restaurant = RestaurantMapper.to_persistence(domain_restaurant)
        else:
            django_restaurant = RestaurantMapper.to_persistence(domain_restaurant)
        
        django_restaurant.save()
        return RestaurantMapper.to_domain(django_restaurant)
    
    @staticmethod
    def list_all() -> List[DomainRestaurant]:
        """Lista todos los restaurantes"""
        queryset = DjangoRestaurant.objects.all()
        return [RestaurantMapper.to_domain(r) for r in queryset]
    
    @staticmethod
    def delete(restaurant_id: int) -> bool:
        """Elimina un restaurante - implementa el puerto"""
        try:
            django_restaurant = DjangoRestaurant.objects.get(id=restaurant_id)
            django_restaurant.delete()
            return True
        except DjangoRestaurant.DoesNotExist:
            return False


class UserRestaurantRepository(UserRestaurantRepositoryPort):
    """Repositorio para relación usuario-restaurante - implementa el puerto"""
    
    @staticmethod
    def get_by_user_id(user_id: int) -> Optional[DomainUserRestaurant]:
        try:
            django_ur = DjangoUserRestaurant.objects.filter(user_id=user_id).first()
            return UserRestaurantMapper.to_domain(django_ur) if django_ur else None
        except DjangoUserRestaurant.DoesNotExist:
            return None
    
    @staticmethod
    def assign(user_id: int, restaurant_id: int) -> DomainUserRestaurant:
        django_ur, created = DjangoUserRestaurant.objects.update_or_create(
            user_id=user_id,
            defaults={'restaurant_id': restaurant_id}
        )
        return UserRestaurantMapper.to_domain(django_ur)
    
    @staticmethod
    def unassign(user_id: int) -> bool:
        deleted, _ = DjangoUserRestaurant.objects.filter(user_id=user_id).delete()
        return deleted > 0