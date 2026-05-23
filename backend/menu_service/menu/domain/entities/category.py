from dataclasses import dataclass
from typing import Optional

from menu.domain.shared import AggregateRoot


@dataclass(kw_only=True)
class Category(AggregateRoot):
    name: str
    restaurant_id: int
    id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    def record_created(self):
        return self.add_domain_event('CategoryCreated', {
            'category_id': self.id,
            'name': self.name,
            'restaurant_id': self.restaurant_id,
        }, aggregate_type='Category')
