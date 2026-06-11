from typing import Optional, List
from menu.domain.entities.category import Category as DomainCategory
from menu.infrastructure.models import Category as CategoryModel
from .base_mapper import BaseMapper


class CategoryMapper(BaseMapper[DomainCategory, CategoryModel]):
    """Mapper para Category entre dominio y Django"""
    
    @classmethod
    def to_domain(cls, model: Optional[CategoryModel]) -> Optional[DomainCategory]:
        if model is None:
            return None
        return DomainCategory(
            id=model.id,
            name=model.name,
            restaurant_id=model.restaurant_id,
        )
    
    @classmethod
    def to_model(cls, domain: DomainCategory) -> CategoryModel:
        return CategoryModel(
            id=domain.id,
            name=domain.name,
            restaurant_id=domain.restaurant_id,
        )