"""
Query: List Categories
CQRS - Query para listar y obtener categorías usando Query pattern
"""
from dataclasses import dataclass
from typing import List, Optional
from .base_query import Query, QueryHandler
from menu.application.ports.category_repository_port import CategoryRepositoryPort
from menu.application.dtos import CategoryDTO


@dataclass
class ListCategoriesQuery(Query):
    """Query to list all categories of a restaurant"""
    restaurant_id: int


@dataclass
class GetCategoryQuery(Query):
    """Query to get a specific category by ID"""
    category_id: int
    restaurant_id: int


class ListCategoriesQueryHandler(QueryHandler):
    """Handler for ListCategoriesQuery"""
    
    def __init__(self, category_repo: CategoryRepositoryPort):
        self.category_repo = category_repo
    
    def handle(self, query: ListCategoriesQuery) -> List[CategoryDTO]:
        """Execute the query - returns list of categories as DTOs"""
        if not query.restaurant_id:
            return []
        
        categories = self.category_repo.list_by_restaurant(query.restaurant_id)
        
        return [
            CategoryDTO(
                id=cat.id,
                name=cat.name,
                restaurant_id=cat.restaurant_id,
            )
            for cat in categories
        ]


class GetCategoryQueryHandler(QueryHandler):
    """Handler for GetCategoryQuery"""
    
    def __init__(self, category_repo: CategoryRepositoryPort):
        self.category_repo = category_repo
    
    def handle(self, query: GetCategoryQuery) -> Optional[CategoryDTO]:
        """Execute the query - returns a single category as DTO"""
        if not query.category_id or not query.restaurant_id:
            return None
        
        category = self.category_repo.get_by_id(query.category_id, query.restaurant_id)
        
        if not category:
            return None
        
        return CategoryDTO(
            id=category.id,
            name=category.name,
            restaurant_id=category.restaurant_id,
        )