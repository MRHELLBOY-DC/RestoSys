"""
BUSINESS RULE — RestaurantNameValidRule

Valida que el nombre de un restaurante sea válido:
    - Mínimo 3 caracteres
    - No vacío

Reutilizable en creación de restaurantes, actualización de nombre, etc.

Ejemplo:
    self._check_rule(RestaurantNameValidRule(restaurant.name))

DDD Pattern: Business Rule / Specification
"""

from users.domain.shared.core.business_rule import BusinessRule


class RestaurantNameValidRule(BusinessRule):
    """Regla de negocio: el nombre del restaurante debe ser válido."""

    def __init__(self, name: str):
        self._name = name

    def is_valid(self) -> bool:
        return self._name is not None and len(self._name.strip()) >= 3

    def message(self) -> str:
        return f"El nombre del restaurante debe tener al menos 3 caracteres. Valor recibido: '{self._name}'"