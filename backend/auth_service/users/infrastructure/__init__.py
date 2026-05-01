# users/infrastructure/__init__.py
"""
Infrastructure Layer - Event Sourcing y acceso a datos
Contiene implementaciones concretas de persistencia y mensajería
"""

from .event_store import EventStore, event_store
from .event_publisher import EventPublisher, event_publisher, publish_event
from .repositories import UserRepository, RestaurantRepository, EventRepository

__all__ = [
    # Event Store
    'EventStore',
    'event_store',
    # Event Publisher
    'EventPublisher',
    'event_publisher',
    'publish_event',
    # Repositories
    'UserRepository',
    'RestaurantRepository',
    'EventRepository',
]