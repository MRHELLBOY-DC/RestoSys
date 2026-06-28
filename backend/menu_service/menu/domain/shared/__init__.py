"""
Domain shared abstractions - re-exportados desde core/
"""
from .core.aggregate_root import AggregateRoot
from .core.domain_event import DomainEvent
from .core.entity import Entity

__all__ = [
    'AggregateRoot',
    'DomainEvent', 
    'Entity',
]