from datetime import datetime
from typing import List, Dict, Any, Optional
from .domain_event import DomainEvent
from .entity import Entity


class AggregateRoot(Entity):
    """Clase base para Agregados (entidades que generan eventos de dominio)"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._domain_events: List[DomainEvent] = []
    
    def add_domain_event(
        self, 
        event_type: str, 
        data: Dict[str, Any], 
        aggregate_type: Optional[str] = None
    ) -> DomainEvent:
        """Agrega un evento de dominio al agregado"""
        event = DomainEvent(
            event_type=event_type,
            aggregate_id=str(self.identity) if self.identity else None,
            aggregate_type=aggregate_type or self.__class__.__name__,
            data=data,
            occurred_at=datetime.utcnow().isoformat()
        )
        self._domain_events.append(event)
        return event
    
    def pull_domain_events(self) -> List[DomainEvent]:
        """Extrae y limpia los eventos de dominio"""
        events = list(self._domain_events)
        self.clear_domain_events()
        return events
    
    def get_domain_events(self) -> List[DomainEvent]:
        """Retorna los eventos de dominio sin limpiarlos"""
        return list(self._domain_events)
    
    def clear_domain_events(self) -> None:
        """Limpia todos los eventos de dominio"""
        self._domain_events = []