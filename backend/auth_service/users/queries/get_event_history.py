"""
Query: Get Event History
CQRS - Query para obtener historial de eventos de un usuario
"""
from users.models import Event


def get_user_events(user_id=None, event_type=None, limit=100):
    """
    Retorna historial de eventos
    Puede filtrar por user_id o tipo de evento
    """
    queryset = Event.objects.all().order_by('-created_at')
    
    if user_id:
        # Filtrar eventos donde el user_id aparece en los datos
        queryset = queryset.filter(data__contains={"user_id": user_id})
    
    if event_type:
        queryset = queryset.filter(type=event_type)
    
    # Limitar resultados
    events = queryset[:limit]
    
    return [
        {
            "id": e.id,
            "type": e.type,
            "data": e.data,
            "created_at": e.created_at.isoformat()
        }
        for e in events
    ]


def get_all_events(limit=100):
    """
    Retorna todos los eventos del sistema
    """
    events = Event.objects.all().order_by('-created_at')[:limit]
    return [
        {
            "id": e.id,
            "type": e.type,
            "data": e.data,
            "created_at": e.created_at.isoformat()
        }
        for e in events
    ]