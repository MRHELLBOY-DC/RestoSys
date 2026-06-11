"""
Queries para obtener historial de eventos
"""
from dataclasses import dataclass
from typing import Optional, List
from users.application.ports.event_store_port import EventStorePort
from users.application.dtos import EventDTO
from .base_query import Query, QueryHandler


@dataclass
class GetUserEventsQuery(Query):
    """Query to get events for a specific user"""
    user_id: int
    event_type: Optional[str] = None
    limit: int = 100


@dataclass
class GetAllEventsQuery(Query):
    """Query to get all events"""
    limit: int = 100


class GetUserEventsQueryHandler(QueryHandler):
    """Handler for GetUserEventsQuery"""
    
    def __init__(self, event_store: EventStorePort):
        self.event_store = event_store
    
    def handle(self, query: GetUserEventsQuery) -> List[EventDTO]:
        """Execute the query"""
        events = self.event_store.get_events_by_user(str(query.user_id), query.event_type, query.limit)
        
        return [
            EventDTO(
                id=e.id,
                type=e.type,
                data=e.data,
                created_at=e.created_at.isoformat() if hasattr(e.created_at, 'isoformat') else str(e.created_at),
            )
            for e in events
        ]


class GetAllEventsQueryHandler(QueryHandler):
    """Handler for GetAllEventsQuery"""
    
    def __init__(self, event_store: EventStorePort):
        self.event_store = event_store
    
    def handle(self, query: GetAllEventsQuery) -> List[EventDTO]:
        """Execute the query"""
        events = self.event_store.get_all_events(query.limit)
        
        return [
            EventDTO(
                id=e.id,
                type=e.type,
                data=e.data,
                created_at=e.created_at.isoformat() if hasattr(e.created_at, 'isoformat') else str(e.created_at),
            )
            for e in events
        ]