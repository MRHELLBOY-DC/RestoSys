"""
Event Store Port - Interfaz para leer eventos
Application define el contrato, Infrastructure lo implementa
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any


class EventStorePort(ABC):
    """Puerto para leer eventos (definido en Application)"""
    
    @abstractmethod
    def get_events_by_user(self, user_id: str, event_type: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """
        Retorna eventos de un usuario específico
        """
        pass
    
    @abstractmethod
    def get_all_events(self, limit: int = 100) -> List[Dict]:
        """
        Retorna todos los eventos
        """
        pass