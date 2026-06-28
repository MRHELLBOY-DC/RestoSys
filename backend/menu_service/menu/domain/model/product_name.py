"""
VALUE OBJECT — ProductName

Encapsula el nombre de un producto con validación.
Inmutable y autovalidado.

DDD Pattern: Value Object
"""

from menu.domain.shared.core.value_object import ValueObject
from menu.domain.shared.rules.product_name_valid_rule import ProductNameValidRule
from menu.domain.shared.rules.string_not_null_or_empty_rule import StringNotNullOrEmptyRule


class ProductName(ValueObject):
    """Value Object que encapsula el nombre de un producto con validación."""

    def __init__(self, value: str):
        self._check_rule(StringNotNullOrEmptyRule(value, "El nombre del producto"))
        self._check_rule(ProductNameValidRule(value))
        self._value = value.strip()

    @classmethod
    def of(cls, value: str) -> "ProductName":
        """Factory method estático."""
        return cls(value)

    @property
    def value(self) -> str:
        return self._value

    def equals_core(self, other: "ProductName") -> bool:
        return self._value == other._value

    def __hash__(self) -> int:
        return hash(self._value)

    def __str__(self) -> str:
        return self._value

    def __repr__(self) -> str:
        return f"ProductName({self._value!r})"