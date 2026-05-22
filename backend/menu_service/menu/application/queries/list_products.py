"""
Query: List Products
CQRS - Query para listar y obtener productos
"""
from typing import List, Optional
from ...infrastructure.repositories import ProductRepository
from ...domain.entities import Product


def list_products_query(restaurant_id: int, category_id: Optional[int] = None) -> List[Product]:
    """
    Lista todos los productos de un restaurante
    Opcionalmente filtra por categoría
    """
    if not restaurant_id:
        return []
    
    products = ProductRepository.list_by_restaurant(restaurant_id)
    
    if category_id:
        products = [p for p in products if p.category_id == category_id]
    
    return products


def get_product_query(product_id: int, restaurant_id: int) -> Optional[Product]:
    """
    Obtiene un producto por ID
    """
    if not product_id or not restaurant_id:
        return None
    
    return ProductRepository.get_by_id(product_id, restaurant_id)