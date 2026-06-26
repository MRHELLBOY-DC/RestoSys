"""
BUSINESS RULE — UsernameValidRule

Valida que un username tenga formato válido:
    - Mínimo 3 caracteres
    - Sin espacios en blanco
    - No vacío

Reutilizable en creación de usuarios, actualización de username, etc.

Ejemplo:
    self._check_rule(UsernameValidRule(user.username))

DDD Pattern: Business Rule / Specification
"""

from users.domain.shared.core.business_rule import BusinessRule


class UsernameValidRule(BusinessRule):
    """Regla de negocio: el username debe tener formato válido."""

    def __init__(self, username: str):
        self._username = username

    def is_valid(self) -> bool:
        if not self._username:
            return False
        if ' ' in self._username:
            return False
        return len(self._username) >= 3

    def message(self) -> str:
        return f"'{self._username}' no es un username válido (mínimo 3 caracteres, sin espacios)"