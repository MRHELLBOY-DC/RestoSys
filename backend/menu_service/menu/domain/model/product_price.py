"""
VALUE OBJECT — ProductPrice

Encapsula el precio de un producto con validación.
Inmutable y autovalidado.

DDD Pattern: Value Object
"""

from decimal import Decimal
from menu.domain.shared.core.value_object import ValueObject
from menu.domain.shared.rules.positive_amount_rule import PositiveAmountRule


class ProductPrice(ValueObject):
    """Value Object que encapsula el precio de un producto con validación."""

    def __init__(self, value: Decimal):
        self._check_rule(PositiveAmountRule(value, "El precio del producto"))
        self._value = value

    @classmethod
    def of(cls, value: Decimal) -> "ProductPrice":
        """Factory method estático."""
        return cls(value)

    @property
    def value(self) -> Decimal:
        return self._value

    def equals_core(self, other: "ProductPrice") -> bool:
        return self._value == other._value

    def __hash__(self) -> int:
        return hash(self._value)

    def __str__(self) -> str:
        return str(self._value)

    def __repr__(self) -> str:
        return f"ProductPrice({self._value})"