"""
BUSINESS RULE — CategoryNameValidRule

Valida que el nombre de una categoría sea válido:
    - Mínimo 3 caracteres

DDD Pattern: Business Rule / Specification
"""

from menu.domain.shared.core.business_rule import BusinessRule


class CategoryNameValidRule(BusinessRule):
    """Regla de negocio: el nombre de la categoría debe ser válido."""

    def __init__(self, name: str):
        self._name = name

    def is_valid(self) -> bool:
        return self._name is not None and len(self._name.strip()) >= 3

    def message(self) -> str:
        return f"El nombre de categoría debe tener al menos 3 caracteres. Valor recibido: '{self._name}'"