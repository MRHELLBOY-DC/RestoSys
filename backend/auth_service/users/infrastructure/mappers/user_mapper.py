from typing import Optional
from users.domain.entities.user import User as DomainUser
from users.infrastructure.models import User as DjangoUser
from users.domain.exceptions import UserNotFoundException
from .base_mapper import BaseMapper


class UserMapper(BaseMapper[DomainUser, DjangoUser]):
    """Mapper para User entre dominio y Django"""
    
    @staticmethod
    def to_domain(django_user: Optional[DjangoUser]) -> DomainUser:
        """Convierte modelo Django a entidad de dominio"""
        if django_user is None:
            raise UserNotFoundException(0)
        return DomainUser(
            id=django_user.id,
            username=django_user.username,
            email=django_user.email,
            role=django_user.role,
            password="",
            full_name=django_user.full_name,
            is_active=django_user.is_active,
            date_joined=django_user.date_joined,
            last_login=django_user.last_login,
        )
    
    @staticmethod
    def to_persistence(domain_user: DomainUser) -> DjangoUser:
        """Convierte entidad de dominio a modelo Django (creación)"""
        if domain_user is None:
            raise ValueError("No se puede convertir un usuario None a Django")
        return DjangoUser(
            id=domain_user.id,
            username=domain_user.username,
            email=domain_user.email,
            role=domain_user.role,
            password=domain_user.password,
            full_name=domain_user.full_name,
            is_active=domain_user.is_active,
            date_joined=domain_user.date_joined,
            last_login=domain_user.last_login,
        )