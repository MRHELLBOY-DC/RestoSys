from typing import Optional, List
from decimal import Decimal
from menu.domain.entities.product import Product as DomainProduct
from menu.infrastructure.models import Product as ProductModel
from .base_mapper import BaseMapper


class ProductMapper(BaseMapper[DomainProduct, ProductModel]):
    """Mapper para Product entre dominio y Django"""
    
    @classmethod
    def to_domain(cls, model: Optional[ProductModel]) -> Optional[DomainProduct]:
        if model is None:
            return None
        return DomainProduct(
            id=model.id,
            name=model.name,
            price=model.price,
            category_id=model.category_id,
            restaurant_id=model.restaurant_id,
            image=model.image,
            description=model.description,
        )
    
    @classmethod
    def to_model(cls, domain: DomainProduct) -> ProductModel:
        return ProductModel(
            id=domain.id,
            name=domain.name,
            price=domain.price,
            category_id=domain.category_id,
            restaurant_id=domain.restaurant_id,
            image=domain.image,
            description=domain.description,
        )