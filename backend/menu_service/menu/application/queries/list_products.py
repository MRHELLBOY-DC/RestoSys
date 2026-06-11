"""
Query: List Products
CQRS - Query para listar y obtener productos usando Query pattern
"""
from dataclasses import dataclass
from typing import List, Optional
from .base_query import Query, QueryHandler
from menu.application.ports.product_repository_port import ProductRepositoryPort
from menu.application.dtos import ProductDTO


@dataclass
class ListProductsQuery(Query):
    """Query to list all products of a restaurant"""
    restaurant_id: int
    category_id: Optional[int] = None


@dataclass
class GetProductQuery(Query):
    """Query to get a specific product by ID"""
    product_id: int
    restaurant_id: int


class ListProductsQueryHandler(QueryHandler):
    """Handler for ListProductsQuery"""
    
    def __init__(self, product_repo: ProductRepositoryPort):
        self.product_repo = product_repo
    
    def handle(self, query: ListProductsQuery) -> List[ProductDTO]:
        """Execute the query - returns list of products as DTOs"""
        if not query.restaurant_id:
            return []
        
        products = self.product_repo.list_by_restaurant(query.restaurant_id)
        
        # Filtrar por categoría si se especifica
        if query.category_id:
            products = [p for p in products if p.category_id == query.category_id]
        
        return [
            ProductDTO(
                id=p.id,
                name=p.name,
                description=p.description,
                price=p.price,
                category_id=p.category_id,
                restaurant_id=p.restaurant_id,
                image=p.image,
            )
            for p in products
        ]


class GetProductQueryHandler(QueryHandler):
    """Handler for GetProductQuery"""
    
    def __init__(self, product_repo: ProductRepositoryPort):
        self.product_repo = product_repo
    
    def handle(self, query: GetProductQuery) -> Optional[ProductDTO]:
        """Execute the query - returns a single product as DTO"""
        if not query.product_id or not query.restaurant_id:
            return None
        
        product = self.product_repo.get_by_id(query.product_id, query.restaurant_id)
        
        if not product:
            return None
        
        return ProductDTO(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            category_id=product.category_id,
            restaurant_id=product.restaurant_id,
            image=product.image,
        )