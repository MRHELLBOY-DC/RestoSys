"""
Restaurant Repository Port - Interfaz para repositorio de restaurantes
Application define el contrato, Infrastructure lo implementa
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from users.domain.entities.restaurant import Restaurant
from django.core.files.uploadedfile import UploadedFile


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

    @abstractmethod
    def create_with_logo(self, name: str, address: str, logo_file: UploadedFile, actor_username: str) -> 'Restaurant':
        """Crea un restaurante con imagen, guardando la URL en la BD"""
        pass

    @abstractmethod
    def update_with_logo(self, restaurant_id: int, name: str, address: str, logo_file: Optional[UploadedFile], actor_username: str) -> 'Restaurant':
        """Actualiza un restaurante, opcionalmente cambiando el logo"""
        pass