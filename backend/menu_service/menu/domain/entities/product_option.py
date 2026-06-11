from dataclasses import dataclass
from decimal import Decimal
from typing import Optional
from menu.domain.shared import AggregateRoot
from menu.domain.exceptions import InvalidOptionDataException


@dataclass(kw_only=True)
class ProductOption(AggregateRoot):
    name: str
    extra_price: Decimal
    product_id: int
    id: Optional[int] = None

    def __post_init__(self):
        """Validaciones automáticas al crear la instancia"""
        self._validate_name()
        self._validate_extra_price()
        self._validate_product_id()

    def _validate_name(self):
        """Valida que el nombre no esté vacío"""
        if not self.name or not self.name.strip():
            raise InvalidOptionDataException('name', 'El nombre de la opción es requerido')
    
    def _validate_extra_price(self):
        """Valida que el precio extra no sea negativo"""
        if self.extra_price < 0:
            raise InvalidOptionDataException('extra_price', 'El precio extra no puede ser negativo')
    
    def _validate_product_id(self):
        """Valida que product_id esté presente"""
        if not self.product_id:
            raise InvalidOptionDataException('product_id', 'Se requiere product_id')
    
    def update_name(self, new_name: str):
        """Actualiza el nombre de la opción con validación"""
        if not new_name or not new_name.strip():
            raise InvalidOptionDataException('name', 'El nombre de la opción no puede estar vacío')
        self.name = new_name.strip()
        return self
    
    def update_extra_price(self, new_extra_price: Decimal):
        """Actualiza el precio extra con validación"""
        if new_extra_price < 0:
            raise InvalidOptionDataException('extra_price', 'El precio extra no puede ser negativo')
        self.extra_price = new_extra_price
        return self

    def record_created(self, product_name=None, restaurant_id=None):
        return self.add_domain_event('OptionCreated', {
            'option_id': self.id,
            'name': self.name,
            'extra_price': str(self.extra_price),
            'product_id': self.product_id,
            'product_name': product_name,
            'restaurant_id': restaurant_id,
        }, aggregate_type='ProductOption')