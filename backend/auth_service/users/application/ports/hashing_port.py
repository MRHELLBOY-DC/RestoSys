from abc import ABC, abstractmethod


class HashingPort(ABC):
    """Puerto para hashing de contraseñas"""
    
    @abstractmethod
    def hash(self, password: str) -> str:
        """Hashea una contraseña"""
        pass
    
    @abstractmethod
    def verify(self, password: str, hashed: str) -> bool:
        """Verifica una contraseña contra su hash"""
        pass