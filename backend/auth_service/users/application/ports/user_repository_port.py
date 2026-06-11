"""
User Repository Port - Interfaz para repositorio de usuarios
Application define el contrato, Infrastructure lo implementa
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from users.domain.entities.user import User


class UserRepositoryPort(ABC):
    """Puerto para operaciones de repositorio de usuarios"""
    
    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Obtiene un usuario por su ID"""
        pass
    
    @abstractmethod
    def get_by_username(self, username: str) -> Optional[User]:
        """Obtiene un usuario por su username"""
        pass
    
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        """Obtiene un usuario por su email"""
        pass
    
    @abstractmethod
    def save(self, user: User) -> User:
        """Guarda un usuario (crea o actualiza)"""
        pass
    
    @abstractmethod
    def list_active(self, role: Optional[str] = None) -> List[User]:
        """Lista usuarios activos, opcionalmente filtrados por rol"""
        pass
    
    @abstractmethod
    def delete(self, user_id: int) -> bool:
        """Elimina (soft delete) un usuario"""
        pass