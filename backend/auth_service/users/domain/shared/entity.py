from abc import ABC, abstractmethod
from typing import Any


class Entity(ABC):
    """Clase base para todas las entidades de dominio"""
    
    @property
    @abstractmethod
    def identity(self) -> Any:
        """Identificador único de la entidad"""
        pass
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, Entity):
            return False
        return self.identity == other.identity
    
    def __hash__(self) -> int:
        return hash(self.identity)