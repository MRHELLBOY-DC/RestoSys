from typing import Optional
from datetime import datetime
from users.domain.entities.event import Event as DomainEvent
from users.infrastructure.models import Event as DjangoEvent
from users.domain.exceptions import EventNotFoundException
from .base_mapper import BaseMapper


class EventMapper(BaseMapper[DomainEvent, DjangoEvent]):
    """Mapper para Event entre dominio y Django"""
    
    @staticmethod
    def to_domain(django_event: Optional[DjangoEvent]) -> DomainEvent:
        """
        Convierte modelo Django a entidad de dominio.
        Lanza excepción si el evento no existe.
        """
        if django_event is None:
            raise EventNotFoundException()
        return DomainEvent(
            id=django_event.id,
            type=django_event.type,
            data=django_event.data,
            aggregate_id=django_event.aggregate_id,
            aggregate_type=django_event.aggregate_type,
            version=django_event.version,
            metadata=django_event.metadata,
            created_at=django_event.created_at if hasattr(django_event.created_at, 'isoformat') else datetime.now(),
        )
    
    @staticmethod
    def to_persistence(domain_event: DomainEvent) -> DjangoEvent:
        """Convierte entidad de dominio a modelo Django"""
        if domain_event is None:
            raise ValueError("No se puede convertir un evento None a Django")
        return DjangoEvent(
            id=domain_event.id,
            type=domain_event.type,
            data=domain_event.data,
            aggregate_id=domain_event.aggregate_id,
            aggregate_type=domain_event.aggregate_type,
            version=domain_event.version,
            metadata=domain_event.metadata,
        )