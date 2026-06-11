from typing import Optional, List
from decimal import Decimal
from menu.domain.entities.product_option import ProductOption as DomainOption
from menu.infrastructure.models import ProductOption as OptionModel
from .base_mapper import BaseMapper


class OptionMapper(BaseMapper[DomainOption, OptionModel]):
    """Mapper para ProductOption entre dominio y Django"""
    
    @classmethod
    def to_domain(cls, model: Optional[OptionModel]) -> Optional[DomainOption]:
        if model is None:
            return None
        return DomainOption(
            id=model.id,
            name=model.name,
            extra_price=model.extra_price,
            product_id=model.product_id,
        )
    
    @classmethod
    def to_model(cls, domain: DomainOption) -> OptionModel:
        return OptionModel(
            id=domain.id,
            name=domain.name,
            extra_price=domain.extra_price,
            product_id=domain.product_id,
        )