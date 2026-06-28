from dataclasses import dataclass
from typing import Any


@dataclass(kw_only=True)
class Entity:
    id: Any = None

    @property
    def identity(self):
        return self.id

    def _check_rule(self, rule) -> None:
        """
        Valida una regla de negocio y lanza excepción si falla.
        
        Este método se añade para permitir validación de reglas de negocio
        desde las entidades y agregados.
        """
        from .business_rule_validation_exception import BusinessRuleValidationException
        if not rule.is_valid():
            raise BusinessRuleValidationException(rule)