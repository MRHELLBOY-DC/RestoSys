"""
Base classes for CQRS Queries
"""
from abc import ABC, abstractmethod
from typing import Dict, Type, Any


class Query(ABC):
    """Base class for all queries"""
    pass


class QueryHandler(ABC):
    """Base class for all query handlers"""
    
    @abstractmethod
    def handle(self, query: Query) -> Any:
        """Execute the query and return result"""
        pass


class QueryBus:
    """Bus for registering and executing queries"""
    
    def __init__(self):
        self._handlers: Dict[Type[Query], QueryHandler] = {}
    
    def register(self, query_class: Type[Query], handler: QueryHandler) -> None:
        """Register a handler for a query type"""
        self._handlers[query_class] = handler
    
    def execute(self, query: Query) -> Any:
        """Execute a query by dispatching to its handler"""
        handler = self._handlers.get(type(query))
        if not handler:
            raise ValueError(f"No handler registered for query {type(query).__name__}")
        return handler.handle(query)