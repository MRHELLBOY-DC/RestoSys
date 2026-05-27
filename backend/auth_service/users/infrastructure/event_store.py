"""
Event Store - Implementación de Event Sourcing
Almacena todos los eventos del sistema de forma inmutable
"""
import json
import uuid
from datetime import datetime
from django.utils import timezone
from users.models import Event


class EventStore:
    """
    Event Store para persistir eventos de forma inmutable
    Implementa el patrón Event Sourcing
    """
    
    @staticmethod
    def append_event(aggregate_id, event_type, data, metadata=None, aggregate_type='User'):
        """
        Guarda un nuevo evento en el Event Store
        Args:
            aggregate_id: ID del agregado (ej: user_id)
            event_type: Tipo de evento (UserCreated, UserUpdated, etc.)
            data: Datos del evento (dict)
            metadata: Metadatos adicionales (dict opcional)
            aggregate_type: Tipo de agregado (default: 'User')
        Returns:
            Event: El evento creado
        """
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
        Ordenados por fecha de creación y versión
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


# Instancia global del Event Store
event_store = EventStore()