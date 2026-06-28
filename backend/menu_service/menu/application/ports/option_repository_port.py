from abc import ABC, abstractmethod
from typing import Optional, List
from decimal import Decimal
from menu.domain.entities.product_option import ProductOption


class OptionRepositoryPort(ABC):
    """Puerto para operaciones de repositorio de opciones de productos"""
    
    @abstractmethod
    def get_by_id(self, option_id: int, restaurant_id: int) -> Optional[ProductOption]:
        """Obtiene una opción por su ID y restaurante"""
        pass
    
    @abstractmethod
    def list_by_product(self, product_id: int, restaurant_id: int) -> List[ProductOption]:
        """Obtiene todas las opciones de un producto"""
        pass
    
    @abstractmethod
    def count_by_product(self, product_id: int, restaurant_id: int) -> int:
        """
        Cuenta cuántas opciones tiene un producto.
        Útil para validar si se puede eliminar el producto.
        """
        pass
    
    @abstractmethod
    def create(self, name: str, extra_price: Decimal, product_id: int) -> ProductOption:
        """Crea una nueva opción"""
        pass
    
    @abstractmethod
    def update(self, option_id: int, restaurant_id: int, **kwargs) -> Optional[ProductOption]:
        """Actualiza una opción existente"""
        pass
    
    @abstractmethod
    def delete(self, option_id: int, restaurant_id: int) -> bool:
        """Elimina una opción"""
        pass