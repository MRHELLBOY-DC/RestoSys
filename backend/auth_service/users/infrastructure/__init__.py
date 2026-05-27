# users/infrastructure/__init__.py
"""
Infrastructure Layer - Event Sourcing y acceso a datos
Contiene implementaciones concretas de persistencia y mensajería
"""

from .event_store import EventStore, event_store
from .repositories import UserRepository, RestaurantRepository, EventRepository
from shared import publish_event

__all__ = [
    'EventStore',
    'event_store',
    'publish_event', 
    'UserRepository',
    'RestaurantRepository',
    'EventRepository',
]