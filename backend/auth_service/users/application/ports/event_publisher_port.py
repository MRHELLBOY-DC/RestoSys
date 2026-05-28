"""
Event Publisher Port - Interfaz para publicar eventos
Application define el contrato, Infrastructure lo implementa
"""
from abc import ABC, abstractmethod
from typing import Any, Dict


class EventPublisherPort(ABC):
    """Puerto para publicar eventos (definido en Application)"""
    
    @abstractmethod
    def persist_and_publish(self, event, routing_key: str) -> Dict[str, Any]:
        """
        Persiste un evento y lo publica en el bus de mensajes
        """
        pass