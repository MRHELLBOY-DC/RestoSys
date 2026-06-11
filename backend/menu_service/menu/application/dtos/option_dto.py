from dataclasses import dataclass
from typing import Dict, Any
from decimal import Decimal


@dataclass
class OptionDTO:
    """DTO para Opción de Producto"""
    id: int
    name: str
    extra_price: Decimal
    product_id: int
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'extra_price': float(self.extra_price),  # Convertir Decimal a float para JSON
            'product_id': self.product_id,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'OptionDTO':
        return cls(
            id=data['id'],
            name=data['name'],
            extra_price=Decimal(str(data.get('extra_price', 0))),
            product_id=data['product_id'],
        )