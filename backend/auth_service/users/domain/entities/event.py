"""
Entidad de dominio Event - PURA (para eventos de dominio, NO para persistencia)
Este es el evento que se usa dentro del dominio y se pasa a través de los puertos.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, Any


@dataclass
class Event:
    """
    Entidad de dominio para eventos
    Representa un evento de dominio puro.
    """
    
    # Atributos 
    type: str
    data: Dict[str, Any]
    created_at: datetime
    aggregate_id: Optional[str]
    aggregate_type: Optional[str]
    version: int
    metadata: Dict[str, Any]
    
    # El id se incluye para eventos recuperados del event store
    id: Optional[int] = None
    
    def __str__(self):
        """Mismo __str__ que tenías"""
        return f"{self.type} - {self.aggregate_id}"