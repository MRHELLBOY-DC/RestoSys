from abc import ABC, abstractmethod
from typing import Any


class Entity(ABC):
    """Clase base para todas las entidades de dominio"""
    
    @property
    @abstractmethod
    def identity(self) -> Any:
        """Identificador único de la entidad"""
        pass
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, Entity):
            return False
        return self.identity == other.identity
    
    def __hash__(self) -> int:
        return hash(self.identity)
    
    def _check_rule(self, rule) -> None:
        """
        Valida una regla de negocio y lanza excepción si falla.
        
        Este método se añade para permitir validación de reglas de negocio
        desde las entidades y agregados.
        """
        from .business_rule_validation_exception import BusinessRuleValidationException
        if not rule.is_valid():
            raise BusinessRuleValidationException(rule)