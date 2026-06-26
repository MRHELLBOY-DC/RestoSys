"""
Data Transfer Objects para Restaurantes - SOLO transfieren datos, SIN validaciones
"""
from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class RestaurantDTO:
    """DTO para restaurante - SOLO transfiere datos"""
    id: int
    name: str
    address: str
    logo: Optional[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'logo': self.logo,
        }