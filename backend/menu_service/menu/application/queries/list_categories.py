"""
Query: List Categories
CQRS - Query para listar y obtener categorías
"""
from typing import List, Optional
from ...infrastructure.repositories import CategoryRepository
from ...domain.entities import Category


def list_categories_query(restaurant_id: int) -> List[Category]:
    """
    Lista todas las categorías de un restaurante
    """
    if not restaurant_id:
        return []
    
    return CategoryRepository.list_by_restaurant(restaurant_id)


def get_category_query(category_id: int, restaurant_id: int) -> Optional[Category]:
    """
    Obtiene una categoría por ID
    """
    if not category_id or not restaurant_id:
        return None
    
    return CategoryRepository.get_by_id(category_id, restaurant_id)