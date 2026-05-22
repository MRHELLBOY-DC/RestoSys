"""
Infrastructure Layer - Modelos, Repositorios y Event Store
"""
from .event_store import EventStore, event_store
from .repositories import (
    CategoryRepository,
    ProductRepository,
    ProductOptionRepository,
)

__all__ = [
    'EventStore',
    'event_store',
    'CategoryRepository',
    'ProductRepository',
    'ProductOptionRepository',
]