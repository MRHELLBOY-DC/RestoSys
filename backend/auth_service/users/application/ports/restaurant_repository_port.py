"""
Restaurant Repository Port - Interfaz para repositorio de restaurantes
Application define el contrato, Infrastructure lo implementa
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from users.domain.entities.restaurant import Restaurant


class RestaurantRepositoryPort(ABC):
    """Puerto para operaciones de repositorio de restaurantes"""
    
    @abstractmethod
    def get_by_id(self, restaurant_id: int) -> Optional[Restaurant]:
        """Obtiene un restaurante por su ID"""
        pass
    
    @abstractmethod
    def save(self, restaurant: Restaurant) -> Restaurant:
        """Guarda un restaurante (crea o actualiza)"""
        pass
    
    @abstractmethod
    def list_all(self) -> List[Restaurant]:
        """Lista todos los restaurantes"""
        pass
    
    @abstractmethod
    def delete(self, restaurant_id: int) -> bool:
        """Elimina un restaurante"""
        pass