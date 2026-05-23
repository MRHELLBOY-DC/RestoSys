from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

from menu.domain.shared import AggregateRoot


@dataclass(kw_only=True)
class Product(AggregateRoot):
    name: str
    price: Decimal
    category_id: int
    restaurant_id: int
    id: Optional[int] = None
    image: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    def record_created(self):
        return self.add_domain_event('ProductCreated', {
            'product_id': self.id,
            'name': self.name,
            'price': str(self.price),
            'category_id': self.category_id,
            'restaurant_id': self.restaurant_id,
            'image': self.image,
            'description': self.description,
        }, aggregate_type='Product')
