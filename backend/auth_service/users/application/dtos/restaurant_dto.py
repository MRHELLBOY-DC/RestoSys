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
    phone: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    delivery_fee: Optional[float] = None
    logo: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'phone': self.phone,
            'lat': self.lat,
            'lng': self.lng,
            'delivery_fee': self.delivery_fee,
            'logo': self.logo,
        }