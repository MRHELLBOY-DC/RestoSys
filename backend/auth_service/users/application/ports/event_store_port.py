"""
Event Store Port - Interfaz para leer eventos
Application define el contrato, Infrastructure lo implementa
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from users.domain.entities.event import Event as DomainEvent


class EventStorePort(ABC):
    """Puerto para leer eventos (definido en Application)"""
    
    @abstractmethod
    def get_events_by_user(self, user_id: str, event_type: Optional[str] = None, limit: int = 100) -> List[DomainEvent]:
        """
        Retorna eventos de un usuario específico como entidades de dominio
        """
        pass
    
    @abstractmethod
    def get_all_events(self, limit: int = 100) -> List[DomainEvent]:
        """
        Retorna todos los eventos como entidades de dominio
        """
        pass