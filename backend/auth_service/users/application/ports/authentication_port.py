"""
Authentication Port - Interfaz para autenticación
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from users.domain.entities.user import User


class AuthenticationPort(ABC):
    """Puerto para servicios de autenticación"""
    
    @abstractmethod
    def authenticate(self, username: str, password: str) -> Dict[str, Any]:
        """
        Autentica un usuario con username y contraseña
        
        Returns:
            Dict con 'success' y 'user' si es exitoso
        """
        pass
    
    @abstractmethod
    def generate_tokens(self, user: User) -> Dict[str, str]:
        """
        Genera tokens JWT para un usuario
        
        Returns:
            Dict con 'access' y 'refresh' tokens
        """
        pass