"""
Data Transfer Objects para Usuarios
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List, Dict, Any


@dataclass
class UserDTO:
    """DTO básico para usuario - SOLO transfiere datos, SIN validaciones"""
    id: int
    username: str
    email: str
    role: str
    full_name: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
        }


@dataclass
class UserProfileDTO:
    """DTO para perfil de usuario (profile view) - SOLO transfiere datos"""
    id: int
    username: str
    email: str
    role: str
    full_name: str
    restaurant: Optional[Dict[str, Any]]
    date_joined: datetime
    last_login: Optional[datetime]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'restaurant': self.restaurant,
            'date_joined': self.date_joined.isoformat() if hasattr(self.date_joined, 'isoformat') else str(self.date_joined),
            'last_login': self.last_login.isoformat() if self.last_login and hasattr(self.last_login, 'isoformat') else str(self.last_login) if self.last_login else None,
        }


@dataclass
class UserListDTO:
    """DTO para listado de usuarios - SOLO transfiere datos"""
    id: int
    username: str
    email: str
    role: str
    full_name: str
    date_joined: datetime
    restaurant: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'date_joined': self.date_joined.isoformat() if hasattr(self.date_joined, 'isoformat') else str(self.date_joined),
            'restaurant': self.restaurant,
        }


@dataclass
class UserDetailDTO:
    """DTO para detalles completos de usuario - SOLO transfiere datos"""
    id: int
    username: str
    email: str
    role: str
    full_name: str
    date_joined: datetime
    last_login: Optional[datetime]
    restaurants: List[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'date_joined': self.date_joined.isoformat() if hasattr(self.date_joined, 'isoformat') else str(self.date_joined),
            'last_login': self.last_login.isoformat() if self.last_login and hasattr(self.last_login, 'isoformat') else str(self.last_login) if self.last_login else None,
            'restaurants': self.restaurants,
        }


@dataclass
class EventDTO:
    """DTO para eventos - SOLO transfiere datos"""
    id: int
    type: str
    data: Dict[str, Any]
    created_at: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'type': self.type,
            'data': self.data,
            'created_at': self.created_at,
        }