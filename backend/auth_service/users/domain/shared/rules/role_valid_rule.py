"""
BUSINESS RULE — RoleValidRule

Valida que el rol de usuario sea uno de los permitidos.

"""

from users.domain.shared.core.business_rule import BusinessRule


class RoleValidRule(BusinessRule):
    """Regla de negocio: el rol debe ser válido."""

    VALID_ROLES = ['cliente', 'restaurante', 'admin', 'empleado', 'repartidor']

    def __init__(self, role: str):
        self._role = role

    def is_valid(self) -> bool:
        return self._role in self.VALID_ROLES

    def message(self) -> str:
        return f"'{self._role}' no es un rol válido. Opciones: {', '.join(self.VALID_ROLES)}"