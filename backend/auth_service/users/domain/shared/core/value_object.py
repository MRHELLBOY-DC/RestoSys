"""
Base class for all value objects.

DDD Pattern: Value Object
"""

from abc import ABC, abstractmethod


class ValueObject(ABC):
    """
    Clase base para Value Objects.
    
    Un Value Object se define por sus atributos, no por su identidad.
    Son inmutables y se comparan por valor.
    """
    
    def _check_rule(self, rule) -> None:
        """Valida una regla de negocio y lanza excepción si falla."""
        from .business_rule_validation_exception import BusinessRuleValidationException
        if not rule.is_valid():
            raise BusinessRuleValidationException(rule)
    
    @abstractmethod
    def equals_core(self, other: "ValueObject") -> bool:
        """Compara dos Value Objects por su valor."""
        pass
    
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, ValueObject):
            return False
        return self.equals_core(other)
    
    def __ne__(self, other: object) -> bool:
        return not self.__eq__(other)