"""
BUSINESS RULE — EmailValidRule

Valida que un email tenga formato válido.
Reutilizable en creación de usuarios, actualización de email, etc.

Ejemplo:
    self._check_rule(EmailValidRule(user.email))

DDD Pattern: Business Rule / Specification
"""

import re
from users.domain.shared.core.business_rule import BusinessRule


class EmailValidRule(BusinessRule):
    """Regla de negocio: el email debe tener formato válido."""

    def __init__(self, email: str):
        self._email = email

    def is_valid(self) -> bool:
        if not self._email:
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, self._email))

    def message(self) -> str:
        return f"'{self._email}' no es un email válido"