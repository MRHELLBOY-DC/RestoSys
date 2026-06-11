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
        self._validate_name()
        self._validate_restaurant_id()

    def _validate_name(self):
        """Valida que el nombre no esté vacío"""
        if not self.name or not self.name.strip():
            raise InvalidCategoryNameException("El nombre de la categoría es requerido")
    
    def _validate_restaurant_id(self):
        """Valida que restaurant_id esté presente"""
        if not self.restaurant_id:
            raise InvalidCategoryNameException("Se requiere restaurant_id")
    
    def update_name(self, new_name: str):
        """Actualiza el nombre de la categoría con validación"""
        if not new_name or not new_name.strip():
            raise InvalidCategoryNameException("El nombre de la categoría es requerido")
        self.name = new_name.strip()
        return self

    def record_created(self):
        return self.add_domain_event('CategoryCreated', {
            'category_id': self.id,
            'name': self.name,
            'restaurant_id': self.restaurant_id,
        }, aggregate_type='Category')