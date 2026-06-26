"""
Exception thrown when a business rule is violated.

DDD Pattern: Business Rule Exception
"""

from .business_rule import BusinessRule


class BusinessRuleValidationException(Exception):
    """
    Excepción lanzada cuando una regla de negocio falla.
    
    Contiene la regla que falló para poder acceder a su mensaje.
    """
    
    def __init__(self, rule: BusinessRule):
        self.rule = rule
        super().__init__(rule.message())
    
    def __str__(self) -> str:
        return self.rule.message()