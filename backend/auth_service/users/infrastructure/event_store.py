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
    
    @staticmethod
    def replay_events(aggregate_id):
        """
        Reconstruye el estado de un agregado replayando todos sus eventos
        """
        events = EventStore.get_events_for_aggregate(aggregate_id)
        
        state = {}
        for event in events:
            state = EventStore._apply_event(state, event)
        
        return state
    
    @staticmethod
    def _apply_event(state, event):
        """
        Aplica un evento al estado (reducer)
        """
        event_type = event.type
        data = event.data.get('data', {})
        
        if event_type == 'UserCreated':
            state = {
                'id': data.get('user_id'),
                'username': data.get('username'),
                'role': data.get('role'),
                'email': data.get('email'),
                'created': True,
                'version': event.version
            }
        elif event_type == 'UserUpdated':
            # Actualiza solo los campos que cambian
            for key, value in data.get('new_data', {}).items():
                state[key] = value
            state['updated'] = True
            state['version'] = event.version
        elif event_type == 'UserDeleted':
            state['is_active'] = False
            state['deleted'] = True
            state['version'] = event.version
        
        return state
    
    @staticmethod
    def get_snapshot(aggregate_id):
        """
        Obtiene el último snapshot de un agregado (optimización)
        """
        # Por ahora retorna None (no hay snapshot implementado)
        # En una implementación completa, guardarías snapshots periódicos
        return None


# Instancia global del Event Store
event_store = EventStore()