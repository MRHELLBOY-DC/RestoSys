"""
GENERIC RULE — NonNegativeAmountRule

Valida que un monto monetario sea mayor o igual a cero (no negativo).
Útil para precios extra de opciones que pueden ser 0.

DDD Pattern: Generic Business Rule / Specification
"""

from decimal import Decimal
from menu.domain.shared.core.business_rule import BusinessRule


class NonNegativeAmountRule(BusinessRule):
    """Regla de negocio: el monto no puede ser negativo."""

    def __init__(self, amount: Decimal, field_name: str):
        self._amount = amount
        self._field_name = field_name

    def is_valid(self) -> bool:
        return self._amount is not None and self._amount >= Decimal("0")

    def message(self) -> str:
        return f"{self._field_name} no puede ser negativo. Valor recibido: {self._amount}"