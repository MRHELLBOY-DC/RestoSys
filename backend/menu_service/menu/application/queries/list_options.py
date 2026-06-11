"""
Query: List Options
CQRS - Query para listar y obtener opciones de productos usando Query pattern
"""
from dataclasses import dataclass
from typing import List, Optional
from .base_query import Query, QueryHandler
from menu.application.ports.option_repository_port import OptionRepositoryPort
from menu.application.ports.product_repository_port import ProductRepositoryPort
from menu.application.dtos import OptionDTO
from menu.domain.exceptions import ProductNotFoundException


@dataclass
class ListOptionsByProductQuery(Query):
    """Query to list all options of a product"""
    product_id: int
    restaurant_id: int


@dataclass
class GetOptionQuery(Query):
    """Query to get a specific option by ID"""
    option_id: int
    restaurant_id: int


class ListOptionsByProductQueryHandler(QueryHandler):
    """Handler for ListOptionsByProductQuery"""
    
    def __init__(
        self,
        option_repo: OptionRepositoryPort,
        product_repo: ProductRepositoryPort
    ):
        self.option_repo = option_repo
        self.product_repo = product_repo
    
    def handle(self, query: ListOptionsByProductQuery) -> List[OptionDTO]:
        """Execute the query - returns list of options as DTOs"""
        if not query.product_id or not query.restaurant_id:
            return []
        
        # Verificar que el producto pertenece al restaurante
        product = self.product_repo.get_by_id(query.product_id, query.restaurant_id)
        if not product:
            return []
        
        options = self.option_repo.list_by_product(query.product_id, query.restaurant_id)
        
        return [
            OptionDTO(
                id=opt.id,
                name=opt.name,
                extra_price=opt.extra_price,
                product_id=opt.product_id,
            )
            for opt in options
        ]


class GetOptionQueryHandler(QueryHandler):
    """Handler for GetOptionQuery"""
    
    def __init__(self, option_repo: OptionRepositoryPort):
        self.option_repo = option_repo
    
    def handle(self, query: GetOptionQuery) -> Optional[OptionDTO]:
        """Execute the query - returns a single option as DTO"""
        if not query.option_id or not query.restaurant_id:
            return None
        
        option = self.option_repo.get_by_id(query.option_id, query.restaurant_id)
        
        if not option:
            return None
        
        return OptionDTO(
            id=option.id,
            name=option.name,
            extra_price=option.extra_price,
            product_id=option.product_id,
        )