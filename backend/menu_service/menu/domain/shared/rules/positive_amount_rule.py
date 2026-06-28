"""
GENERIC RULE — PositiveAmountRule

Valida que un monto monetario sea estrictamente mayor a cero.

DDD Pattern: Generic Business Rule / Specification
"""

from decimal import Decimal
from menu.domain.shared.core.business_rule import BusinessRule


class PositiveAmountRule(BusinessRule):
    """Regla de negocio: el monto debe ser mayor a cero."""

    def __init__(self, amount: Decimal, field_name: str):
        self._amount = amount
        self._field_name = field_name

    def is_valid(self) -> bool:
        return self._amount is not None and self._amount > Decimal("0")

    def message(self) -> str:
        return f"{self._field_name} debe ser mayor a cero. Valor recibido: {self._amount}"