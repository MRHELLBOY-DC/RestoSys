"""
Event Store - Implementación de Event Sourcing
"""
from decimal import Decimal
from typing import Optional, List, Dict, Any
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

from users.infrastructure.models import Event as DjangoEvent
from users.infrastructure.mappers.event_mapper import EventMapper
from users.domain.entities.event import Event as DomainEvent
from users.application.ports.event_store_port import EventStorePort


class EventStore(EventStorePort):

    @staticmethod
    def _convert_decimals(obj):
        if isinstance(obj, dict):
            return {k: EventStore._convert_decimals(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [EventStore._convert_decimals(item) for item in obj]
        elif isinstance(obj, Decimal):
            return str(obj)
        return obj

    @staticmethod
    def append(
        aggregate_id: str,
        event_type: str,
        data: Dict,
        aggregate_type: str = 'User',
        metadata: Optional[Dict] = None
    ) -> DomainEvent:
        try:
            data = EventStore._convert_decimals(data)
            if metadata:
                metadata = EventStore._convert_decimals(metadata)

            last_event = DjangoEvent.objects.filter(
                aggregate_id=str(aggregate_id)
            ).order_by('-version').first()

            version = (last_event.version + 1) if last_event else 1

            event_data_for_db = {
                "aggregate_id": str(aggregate_id),
                "event_type": event_type,
                "data": data,
                "metadata": metadata or {}
            }

            django_event = DjangoEvent.objects.create(
                type=event_type,
                data=event_data_for_db,
                aggregate_id=str(aggregate_id),
                aggregate_type=aggregate_type,
                version=version,
                metadata=metadata or {},
                created_at=timezone.now()
            )

            logger.info(f"Evento guardado: {event_type} | aggregate={aggregate_id}")
            print(f"EventStore.append → {event_type} (ID={django_event.id})")

            return EventMapper.to_domain(django_event)

        except Exception as e:
            logger.error(f"Error en EventStore.append: {e}", exc_info=True)
            print(f"EventStore.append ERROR: {e}")
            raise

    # Resto de métodos sin cambios...
    @staticmethod
    def get_by_aggregate(aggregate_id: str) -> List[DomainEvent]:
        django_events = DjangoEvent.objects.filter(aggregate_id=str(aggregate_id)).order_by('created_at', 'version')
        return [EventMapper.to_domain(e) for e in django_events]

    @staticmethod
    def get_by_type(event_type: str, limit: int = 100) -> List[DomainEvent]:
        django_events = DjangoEvent.objects.filter(type=event_type).order_by('-created_at')[:limit]
        return [EventMapper.to_domain(e) for e in django_events]

    @staticmethod
    def get_events_by_user(user_id: str, event_type: Optional[str] = None, limit: int = 100) -> List[DomainEvent]:
        events = EventStore.get_by_aggregate(user_id)
        if event_type:
            events = [e for e in events if e.type == event_type]
        return events[:limit]

    @staticmethod
    def get_all_events(limit: int = 100) -> List[DomainEvent]:
        django_events = DjangoEvent.objects.all().order_by('-created_at')[:limit]
        return [EventMapper.to_domain(e) for e in django_events]


event_store = EventStore()