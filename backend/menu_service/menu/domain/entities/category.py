from dataclasses import dataclass
from typing import Optional
from menu.domain.shared import AggregateRoot
from menu.domain.exceptions import InvalidCategoryNameException


@dataclass(kw_only=True)
class Category(AggregateRoot):
    name: str
    restaurant_id: int
    id: Optional[int] = None

    def __post_init__(self):
        """Validaciones automáticas al crear la instancia"""
        self._domain_events = []
        self._validate()

    def _validate(self):
        """
        Valida las reglas de negocio de la Category.
        Estas validaciones se ejecutan automáticamente al crear o reconstituir una Category.
        """
        from menu.domain.shared.rules import (
            StringNotNullOrEmptyRule,
            CategoryNameValidRule
        )
        
        self._check_rule(StringNotNullOrEmptyRule(self.name, "El nombre de la categoría"))
        self._check_rule(CategoryNameValidRule(self.name))
        
        if not self.restaurant_id:
            raise InvalidCategoryNameException("Se requiere restaurant_id")

    def update_name(self, new_name: str):
        """Actualiza el nombre de la categoría con validación"""
        from menu.domain.shared.rules import CategoryNameValidRule, StringNotNullOrEmptyRule
        
        self._check_rule(StringNotNullOrEmptyRule(new_name, "El nombre de la categoría"))
        self._check_rule(CategoryNameValidRule(new_name))
        self.name = new_name.strip()
        return self

    def record_created(self):
        return self.add_domain_event('CategoryCreated', {
            'category_id': self.id,
            'name': self.name,
            'restaurant_id': self.restaurant_id,
        }, aggregate_type='Category')