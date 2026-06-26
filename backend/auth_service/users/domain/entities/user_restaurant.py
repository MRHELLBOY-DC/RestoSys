"""
Entidad de dominio UserRestaurant - PURA
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Any, Dict
from users.domain.shared import AggregateRoot


@dataclass
class UserRestaurant(AggregateRoot):
    """Entidad de dominio UserRestaurant - Hereda de AggregateRoot"""
    
    id: Optional[int]
    user_id: int
    restaurant_id: int
    
    def __post_init__(self):
        """Inicializa la lista de eventos después de la creación"""
        self._domain_events = []
    
    @property
    def identity(self) -> Optional[int]:
        return self.id
    
    def __str__(self) -> str:
        return f"UserRestaurant(id={self.id}, user_id={self.user_id}, restaurant_id={self.restaurant_id})"