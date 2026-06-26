"""
GENERIC RULE — StringNotNullOrEmptyRule

Valida que un String no sea nulo ni vacío.
Reutilizable en cualquier Aggregate del dominio.

Ejemplo:
    self._check_rule(StringNotNullOrEmptyRule(username, "El nombre de usuario"))
    self._check_rule(StringNotNullOrEmptyRule(email, "El email"))

DDD Pattern: Generic Business Rule / Specification
"""

from users.domain.shared.core.business_rule import BusinessRule


class StringNotNullOrEmptyRule(BusinessRule):
    """Regla de negocio: el string no puede ser nulo ni vacío."""

    def __init__(self, value: str, field_name: str):
        self._value = value
        self._field_name = field_name

    def is_valid(self) -> bool:
        return self._value is not None and len(self._value.strip()) > 0

    def message(self) -> str:
        return f"{self._field_name} no puede ser nulo ni vacío"