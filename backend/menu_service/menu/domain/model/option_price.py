"""
VALUE OBJECT — OptionPrice

Encapsula el precio extra de una opción con validación.
Inmutable y autovalidado.
Permite valores >= 0 (puede ser gratis).

DDD Pattern: Value Object
"""

from decimal import Decimal
from menu.domain.shared.core.value_object import ValueObject
from menu.domain.shared.rules.non_negative_amount_rule import NonNegativeAmountRule


class OptionPrice(ValueObject):
    """Value Object que encapsula el precio extra de una opción con validación."""

    def __init__(self, value: Decimal):
        self._check_rule(NonNegativeAmountRule(value, "El precio extra de la opción"))
        self._value = value

    @classmethod
    def of(cls, value: Decimal) -> "OptionPrice":
        """Factory method estático."""
        return cls(value)

    @property
    def value(self) -> Decimal:
        return self._value

    def equals_core(self, other: "OptionPrice") -> bool:
        return self._value == other._value

    def __hash__(self) -> int:
        return hash(self._value)

    def __str__(self) -> str:
        return str(self._value)

    def __repr__(self) -> str:
        return f"OptionPrice({self._value})"