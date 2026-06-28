# menu/application/ports/product_repository_port.py
from abc import ABC, abstractmethod
from typing import Optional, List, Any
from decimal import Decimal
from menu.domain.entities.product import Product


class ProductRepositoryPort(ABC):
    """Puerto para operaciones de repositorio de productos"""
    
    @abstractmethod
    def get_by_id(self, product_id: int, restaurant_id: int) -> Optional[Product]:
        """Obtiene un producto por su ID y restaurante"""
        pass
    
    @abstractmethod
    def list_by_restaurant(self, restaurant_id: int) -> List[Product]:
        """Obtiene todos los productos de un restaurante"""
        pass
    
    @abstractmethod
    def list_by_category(self, category_id: int, restaurant_id: int) -> List[Product]:
        """
        Obtiene todos los productos de una categoría específica.
        Útil para verificar si una categoría tiene productos antes de eliminar.
        """
        pass
    
    @abstractmethod
    def count_by_category(self, category_id: int, restaurant_id: int) -> int:
        """
        Cuenta cuántos productos tiene una categoría.
        Útil para validar si se puede eliminar la categoría.
        """
        pass
    
    @abstractmethod
    def create(self, name: str, price: Decimal, category_id: int, restaurant_id: int,
            image: Optional[str] = None, description: Optional[str] = None) -> Product:
        """Crea un nuevo producto (con URL de imagen o None)"""
        pass
    
    @abstractmethod
    def create_with_image(self, name: str, price: Decimal, category_id: int,
        restaurant_id: int, image_file: Any,
        description: Optional[str] = None) -> Product:
        """
        Crea un nuevo producto con un archivo de imagen subido.
        El repositorio se encarga de guardar el archivo y almacenar la URL.
        """
        pass
    
    @abstractmethod
    def update(self, product_id: int, restaurant_id: int, **kwargs) -> Optional[Product]:
        """Actualiza un producto existente (campos simples)"""
        pass
    
    @abstractmethod
    def update_with_image(self, product_id: int, restaurant_id: int,
                          image_file: Any, **kwargs) -> Optional[Product]:
        """
        Actualiza un producto existente, incluyendo un nuevo archivo de imagen.
        El repositorio se encarga de guardar el archivo y actualizar la URL.
        """
        pass
    
    @abstractmethod
    def delete(self, product_id: int, restaurant_id: int) -> bool:
        """Elimina un producto"""
        pass