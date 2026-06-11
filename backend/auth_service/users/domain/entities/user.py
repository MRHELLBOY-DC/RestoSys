"""
Entidad de dominio User - PURA
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Any, Dict
from users.domain.shared.aggregate_root import AggregateRoot
from users.domain.shared.domain_event import DomainEvent


@dataclass
class User(AggregateRoot):
    """Entidad de dominio User - Hereda de AggregateRoot"""
    
    # Atributos
    id: Optional[int]
    username: str
    email: str
    role: str
    password: str = ""
    full_name: str = ""
    is_active: bool = True
    date_joined: datetime = field(default_factory=datetime.now)
    last_login: Optional[datetime] = None
    
    def __post_init__(self):
        """Inicializa la lista de eventos después de la creación"""
        self._domain_events = []
    
    @property
    def identity(self) -> Optional[int]:
        """Implementación de la propiedad abstracta"""
        return self.id
    
    def record_created(self) -> Dict[str, Any]:
        """Registra evento UserCreated"""
        return self.add_domain_event('UserCreated', {
            'user_id': self.id,
            'username': self.username,
            'role': self.role,
            'email': self.email,
            'full_name': self.full_name,
        }).data
    
    def record_updated(self, old_data: Dict, new_data: Dict) -> Dict[str, Any]:
        """Registra evento UserUpdated"""
        return self.add_domain_event('UserUpdated', {
            'user_id': self.id,
            'username': self.username,
            'old_data': old_data,
            'new_data': new_data,
        }).data
    
    def record_deleted(self) -> Dict[str, Any]:
        """Registra evento UserDeleted"""
        return self.add_domain_event('UserDeleted', {
            'user_id': self.id,
            'username': self.username,
            'role': self.role,
            'is_active': self.is_active,
        }).data