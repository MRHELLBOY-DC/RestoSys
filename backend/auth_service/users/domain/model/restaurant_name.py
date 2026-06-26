"""
VALUE OBJECT — RestaurantName

Encapsula el nombre de un restaurante con validación.
Inmutable y autovalidado.

DDD Pattern: Value Object
"""

from users.domain.shared.core.value_object import ValueObject
from users.domain.shared.rules.restaurant_name_valid_rule import RestaurantNameValidRule


class RestaurantName(ValueObject):
    """Value Object que encapsula el nombre de un restaurante con validación."""

    def __init__(self, value: str):
        self._check_rule(RestaurantNameValidRule(value))
        self._value = value.strip()

    @classmethod
    def of(cls, value: str) -> "RestaurantName":
        """Factory method estático."""
        return cls(value)

    @property
    def value(self) -> str:
        return self._value

    def equals_core(self, other: "RestaurantName") -> bool:
        return self._value == other._value

    def __hash__(self) -> int:
        return hash(self._value)

    def __str__(self) -> str:
        return self._value

    def __repr__(self) -> str:
        return f"RestaurantName({self._value!r})"