from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from decimal import Decimal
from .option_dto import OptionDTO


@dataclass
class ProductDTO:
    """DTO para Producto"""
    id: int
    name: str
    description: Optional[str]
    price: Decimal
    category_id: int
    restaurant_id: int
    image: Optional[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description or '',
            'price': float(self.price),  # Convertir Decimal a float para JSON
            'category_id': self.category_id,
            'restaurant_id': self.restaurant_id,
            'image': self.image,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ProductDTO':
        return cls(
            id=data['id'],
            name=data['name'],
            description=data.get('description'),
            price=Decimal(str(data['price'])),
            category_id=data['category_id'],
            restaurant_id=data['restaurant_id'],
            image=data.get('image'),
        )


@dataclass
class ProductWithOptionsDTO:
    """DTO para Producto con sus opciones"""
    product: ProductDTO
    options: List[OptionDTO]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **self.product.to_dict(),
            'options': [opt.to_dict() for opt in self.options],
        }