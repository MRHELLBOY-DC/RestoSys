from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

from menu.domain.shared import AggregateRoot


@dataclass(kw_only=True)
class ProductOption(AggregateRoot):
    name: str
    extra_price: Decimal
    product_id: int
    id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    def record_created(self, product_name=None, restaurant_id=None):
        return self.add_domain_event('OptionCreated', {
            'option_id': self.id,
            'name': self.name,
            'extra_price': str(self.extra_price),
            'product_id': self.product_id,
            'product_name': product_name,
            'restaurant_id': restaurant_id,
        }, aggregate_type='ProductOption')
