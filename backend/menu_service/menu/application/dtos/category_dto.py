from dataclasses import dataclass
from typing import Dict, Any


@dataclass
class CategoryDTO:
    """DTO para Categoría"""
    id: int
    name: str
    restaurant_id: int
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'restaurant_id': self.restaurant_id,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CategoryDTO':
        return cls(
            id=data['id'],
            name=data['name'],
            restaurant_id=data['restaurant_id'],
        )