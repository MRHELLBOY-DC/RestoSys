"""
Entidad de dominio Restaurant - PURA
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Any, Dict
from users.domain.shared.aggregate_root import AggregateRoot


@dataclass
class Restaurant(AggregateRoot):
    """Entidad de dominio Restaurant - Hereda de AggregateRoot"""
    
    id: Optional[int]
    name: str
    address: str
    logo: Optional[str] = None
    
    def __post_init__(self):
        """Inicializa la lista de eventos después de la creación"""
        self._domain_events = []
    
    @property
    def identity(self) -> Optional[int]:
        return self.id
    
    def __str__(self) -> str:
        return self.name
    
    # ========== MÉTODOS DE EVENTOS DE DOMINIO ==========
    
    def record_created(self, actor_username: str = None) -> Dict[str, Any]:
        """Registra evento RestaurantCreated"""
        data = {
            'restaurant_id': self.id,
            'name': self.name,
            'address': self.address,
            'logo': self.logo,
        }
        if actor_username:
            data['actor_username'] = actor_username
        return self.add_domain_event('RestaurantCreated', data).data
    
    def record_updated(self, old_data: Dict, actor_username: str = None) -> Dict[str, Any]:
        """Registra evento RestaurantUpdated"""
        data = {
            'restaurant_id': self.id,
            'name': self.name,
            'old_data': old_data,
            'new_data': {
                'name': self.name,
                'address': self.address,
                'logo': self.logo,
            },
        }
        if actor_username:
            data['actor_username'] = actor_username
        return self.add_domain_event('RestaurantUpdated', data).data
    
    def record_deleted(self, actor_username: str = None) -> Dict[str, Any]:
        """Registra evento RestaurantDeleted"""
        data = {
            'restaurant_id': self.id,
            'name': self.name,
        }
        if actor_username:
            data['actor_username'] = actor_username
        return self.add_domain_event('RestaurantDeleted', data).data