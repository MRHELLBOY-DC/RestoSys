"""
Entidad de dominio User - PURA
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Any, Dict
from users.domain.shared import AggregateRoot
from users.domain.shared import DomainEvent


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
        self._validate()
    
    def _validate(self) -> None:
        """
        Valida las reglas de negocio del User.
        Estas validaciones se ejecutan automáticamente al crear o reconstituir un User.
        """
        from users.domain.shared.rules import (
            StringNotNullOrEmptyRule,
            EmailValidRule,
            UsernameValidRule
        )
        
        self._check_rule(StringNotNullOrEmptyRule(self.username, "El nombre de usuario"))
        self._check_rule(UsernameValidRule(self.username))
        self._check_rule(EmailValidRule(self.email))
    
    @property
    def identity(self) -> Optional[int]:
        """Implementación de la propiedad abstracta"""
        return self.id
    
    # ========== MÉTODOS DE COMPORTAMIENTO (NUEVOS) ==========
    
    def update_email(self, new_email: str) -> None:
        """
        Actualiza el email con validación de negocio.
        """
        from users.domain.shared.rules import EmailValidRule
        
        self._check_rule(EmailValidRule(new_email))
        old_data = {'email': self.email}
        self.email = new_email.lower().strip()
        self.record_updated(old_data, {'email': self.email})
    
    def update_username(self, new_username: str) -> None:
        """
        Actualiza el username con validación de negocio.
        """
        from users.domain.shared.rules import StringNotNullOrEmptyRule, UsernameValidRule
        
        self._check_rule(StringNotNullOrEmptyRule(new_username, "El nombre de usuario"))
        self._check_rule(UsernameValidRule(new_username))
        old_data = {'username': self.username}
        self.username = new_username.strip()
        self.record_updated(old_data, {'username': self.username})
    
    def activate(self) -> None:
        """Activa el usuario."""
        if not self.is_active:
            self.is_active = True
    
    def deactivate(self) -> None:
        """Desactiva el usuario (soft delete)."""
        if self.is_active:
            self.is_active = False
            self.record_deleted()
    
    # ========== MÉTODOS DE EVENTOS DE DOMINIO ==========
    
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