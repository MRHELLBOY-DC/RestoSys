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
        
        # ========== PRODUCT EVENTS ==========
        if event_type == 'ProductCreated':
            state = {
                'id': data.get('product_id'),
                'name': data.get('name'),
                'price': data.get('price'),
                'category_id': data.get('category_id'),
                'restaurant_id': data.get('restaurant_id'),
                'image': data.get('image'),
                'description': data.get('description'),
                'created': True,
                'version': event.version
            }
        elif event_type == 'ProductUpdated':
            # Obtener las actualizaciones (pueden venir como 'updates' o 'new_data')
            updates = data.get('updates', data.get('new_data', {}))
            for key, value in updates.items():
                state[key] = value
            state['updated'] = True
            state['version'] = event.version
        elif event_type == 'ProductDeleted':
            state['deleted'] = True
            state['version'] = event.version
        
        # ========== CATEGORY EVENTS ==========
        elif event_type == 'CategoryCreated':
            state = {
                'id': data.get('category_id'),
                'name': data.get('name'),
                'restaurant_id': data.get('restaurant_id'),
                'created': True,
                'version': event.version
            }
        elif event_type == 'CategoryUpdated':
            # Obtener el nuevo nombre (puede venir como 'name' o dentro de 'new_data')
            new_name = data.get('name')
            if not new_name:
                new_name = data.get('new_data', {}).get('name')
            if new_name:
                state['name'] = new_name
            state['updated'] = True
            state['version'] = event.version
        elif event_type == 'CategoryDeleted':
            state['deleted'] = True
            state['version'] = event.version
        
        # ========== OPTION EVENTS ==========
        elif event_type == 'OptionCreated':
            state = {
                'id': data.get('option_id'),
                'name': data.get('name'),
                'extra_price': data.get('extra_price'),
                'product_id': data.get('product_id'),
                'product_name': data.get('product_name'),
                'created': True,
                'version': event.version
            }
        elif event_type == 'OptionUpdated':
            # Obtener las actualizaciones
            updates = data.get('new_data', {})
            for key, value in updates.items():
                state[key] = value
            state['updated'] = True
            state['version'] = event.version
        elif event_type == 'OptionDeleted':
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