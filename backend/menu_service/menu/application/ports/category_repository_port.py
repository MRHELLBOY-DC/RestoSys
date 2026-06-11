from abc import ABC, abstractmethod
from typing import Optional, List
from menu.domain.entities.category import Category


class CategoryRepositoryPort(ABC):
    """Puerto para operaciones de repositorio de categorías"""
    
    @abstractmethod
    def get_by_id(self, category_id: int, restaurant_id: int) -> Optional[Category]:
        """Obtiene una categoría por su ID y restaurante"""
        pass
    
    @abstractmethod
    def list_by_restaurant(self, restaurant_id: int) -> List[Category]:
        """Obtiene todas las categorías de un restaurante"""
        pass
    
    @abstractmethod
    def create(self, name: str, restaurant_id: int) -> Category:
        """Crea una nueva categoría"""
        pass
    
    @abstractmethod
    def update(self, category_id: int, restaurant_id: int, name: str) -> Optional[Category]:
        """Actualiza una categoría existente"""
        pass
    
    @abstractmethod
    def delete(self, category_id: int, restaurant_id: int) -> bool:
        """Elimina una categoría"""
        pass