"""
Base class for all business rules in the domain.

DDD Pattern: Business Rule / Specification
"""

from abc import ABC, abstractmethod


class BusinessRule(ABC):
    """
    Clase base para todas las reglas de negocio del dominio.
    
    Cada regla debe implementar:
        - is_valid(): Lógica de validación
        - message(): Mensaje de error si la regla falla
    """
    
    @abstractmethod
    def is_valid(self) -> bool:
        """Valida si la regla de negocio se cumple."""
        pass
    
    @abstractmethod
    def message(self) -> str:
        """Mensaje de error cuando la regla no se cumple."""
        pass