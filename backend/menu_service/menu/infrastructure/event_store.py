"""
Event Store - Implementación de Event Sourcing para menu_service
Almacena todos los eventos del sistema de forma inmutable
"""
from decimal import Decimal
from django.utils import timezone
from .models import Event


class EventStore:
    """
    Event Store para persistir eventos de forma inmutable
    Implementa el patrón Event Sourcing
    """
    
    @staticmethod
    def _convert_decimals(obj):
        """
        Convierte objetos Decimal a string para JSON serialization
        """
        if isinstance(obj, dict):
            return {k: EventStore._convert_decimals(v) for k, v in obj.items()}
        elif isinstance(obj, Decimal):
            return str(obj)
        elif isinstance(obj, list):
            return [EventStore._convert_decimals(item) for item in obj]
        return obj
    
    @staticmethod
    def append_event(aggregate_id, event_type, data, metadata=None, aggregate_type='Product'):
        """
        Guarda un nuevo evento en el Event Store
        """
        # Convertir Decimal a string en data y metadata
        data = EventStore._convert_decimals(data)
        if metadata:
            metadata = EventStore._convert_decimals(metadata)
        
        # Obtener la versión del último evento
        last_event = Event.objects.filter(
            aggregate_id=str(aggregate_id)
        ).order_by('-version').first()
        
        version = (last_event.version + 1) if last_event else 1
        
        event_data = {
            "aggregate_id": str(aggregate_id),
            "event_type": event_type,
            "data": data,
            "metadata": metadata or {}
        }
        
        event = Event.objects.create(
            type=event_type,
            data=event_data,
            aggregate_id=str(aggregate_id),
            aggregate_type=aggregate_type,
            version=version,
            metadata=metadata or {},
            created_at=timezone.now()
        )
        
        return event
    
    @staticmethod
    def get_events_for_aggregate(aggregate_id):
        """
        Recupera todos los eventos de un agregado específico
        """
        events = Event.objects.filter(
            aggregate_id=str(aggregate_id)
        ).order_by('created_at', 'version')
        
        return list(events)
    
    @staticmethod
    def get_events_by_type(event_type, limit=100):
        """
        Recupera eventos por tipo
        """
        events = Event.objects.filter(
            type=event_type
        ).order_by('-created_at')[:limit]
        
        return list(events)

event_store = EventStore()