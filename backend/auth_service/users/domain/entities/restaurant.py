"""
Entidad de dominio Restaurant - PURA
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Any, Dict
from users.domain.shared import AggregateRoot


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
        self._validate()
    
    def _validate(self) -> None:
        """
        Valida las reglas de negocio del Restaurant.
        Estas validaciones se ejecutan automáticamente al crear o reconstituir un Restaurant.
        """
        from users.domain.shared.rules import (
            StringNotNullOrEmptyRule,
            RestaurantNameValidRule
        )
        
        self._check_rule(RestaurantNameValidRule(self.name))
        self._check_rule(StringNotNullOrEmptyRule(self.address, "La dirección del restaurante"))
    
    @property
    def identity(self) -> Optional[int]:
        return self.id
    
    def __str__(self) -> str:
        return self.name
    
    # ========== MÉTODOS DE COMPORTAMIENTO (NUEVOS) ==========
    
    def update_name(self, new_name: str) -> None:
        """
        Actualiza el nombre del restaurante con validación de negocio.
        """
        from users.domain.shared.rules import RestaurantNameValidRule
        
        self._check_rule(RestaurantNameValidRule(new_name))
        old_data = {'name': self.name}
        self.name = new_name.strip()
        self.record_updated(old_data, {'name': self.name})
    
    def update_address(self, new_address: str) -> None:
        """
        Actualiza la dirección del restaurante con validación de negocio.
        """
        from users.domain.shared.rules import StringNotNullOrEmptyRule
        
        self._check_rule(StringNotNullOrEmptyRule(new_address, "La dirección del restaurante"))
        old_data = {'address': self.address}
        self.address = new_address.strip()
        self.record_updated(old_data, {'address': self.address})
    
    def update_logo(self, new_logo: Optional[str]) -> None:
        """
        Actualiza el logo del restaurante.
        """
        old_data = {'logo': self.logo}
        self.logo = new_logo
        self.record_updated(old_data, {'logo': self.logo})
    
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