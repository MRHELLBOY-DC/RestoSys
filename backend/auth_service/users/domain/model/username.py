"""
VALUE OBJECT — Username

Encapsula un username con validación de formato.
Inmutable y autovalidado.

DDD Pattern: Value Object
"""

from users.domain.shared.core.value_object import ValueObject
from users.domain.shared.rules.username_valid_rule import UsernameValidRule
from users.domain.shared.rules.string_not_null_or_empty_rule import StringNotNullOrEmptyRule


class Username(ValueObject):
    """Value Object que encapsula un username con validación."""

    def __init__(self, value: str):
        self._check_rule(StringNotNullOrEmptyRule(value, "El nombre de usuario"))
        self._check_rule(UsernameValidRule(value))
        self._value = value.strip()

    @classmethod
    def of(cls, value: str) -> "Username":
        """Factory method estático."""
        return cls(value)

    @property
    def value(self) -> str:
        return self._value

    def equals_core(self, other: "Username") -> bool:
        return self._value == other._value

    def __hash__(self) -> int:
        return hash(self._value)

    def __str__(self) -> str:
        return self._value

    def __repr__(self) -> str:
        return f"Username({self._value!r})"