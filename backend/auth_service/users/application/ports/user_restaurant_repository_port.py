"""
UserRestaurant Repository Port - Interfaz para repositorio de relación usuario-restaurante
Application define el contrato, Infrastructure lo implementa
"""
from abc import ABC, abstractmethod
from typing import Optional
from users.domain.entities.user_restaurant import UserRestaurant


class UserRestaurantRepositoryPort(ABC):
    """Puerto para operaciones de repositorio de relación usuario-restaurante"""
    
    @abstractmethod
    def get_by_user_id(self, user_id: int) -> Optional[UserRestaurant]:
        """Obtiene la relación por ID de usuario"""
        pass
    
    @abstractmethod
    def assign(self, user_id: int, restaurant_id: int) -> UserRestaurant:
        """Asigna un restaurante a un usuario"""
        pass
    
    @abstractmethod
    def unassign(self, user_id: int) -> bool:
        """Desasigna el restaurante de un usuario"""
        pass