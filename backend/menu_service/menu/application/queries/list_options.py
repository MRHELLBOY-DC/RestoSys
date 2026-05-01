"""
Query: List Options
CQRS - Query para listar y obtener opciones de productos
"""
from typing import List, Optional
from ...infrastructure.repositories import ProductOptionRepository, ProductRepository
from ...domain.entities import ProductOption


def list_options_by_product_query(product_id: int, restaurant_id: int) -> List[ProductOption]:
    """
    Lista todas las opciones de un producto
    """
    if not product_id or not restaurant_id:
        return []
    
    # Verificar que el producto pertenece al restaurante
    product = ProductRepository.get_by_id(product_id, restaurant_id)
    if not product:
        return []
    
    return ProductOptionRepository.list_by_product(product_id, restaurant_id)


def get_option_query(option_id: int, restaurant_id: int) -> Optional[ProductOption]:
    """
    Obtiene una opción por ID
    """
    if not option_id or not restaurant_id:
        return None
    
    return ProductOptionRepository.get_by_id(option_id, restaurant_id)