"""
Data Transfer Objects para Restaurantes
"""
from dataclasses import dataclass
from typing import Optional, Dict, Any


def validate_restaurant_name(name: str) -> bool:
    """Valida nombre de restaurante"""
    if not name or len(name.strip()) < 3:
        return False
    return True


@dataclass
class RestaurantDTO:
    """DTO para restaurante"""
    id: int
    name: str
    address: str
    logo: Optional[str]
    
    def __post_init__(self):
        """Validaciones automáticas al crear el DTO"""
        if not validate_restaurant_name(self.name):
            raise ValueError(f"Nombre de restaurante inválido: '{self.name}'")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'logo': self.logo,
        }