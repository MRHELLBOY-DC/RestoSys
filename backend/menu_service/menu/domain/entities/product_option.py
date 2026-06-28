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
        self._domain_events = []
        self._validate()

    def _validate(self):
        """
        Valida las reglas de negocio del ProductOption.
        Estas validaciones se ejecutan automáticamente al crear o reconstituir un ProductOption.
        """
        from menu.domain.shared.rules import (
            StringNotNullOrEmptyRule,
            OptionNameValidRule,
            NonNegativeAmountRule
        )
        
        self._check_rule(StringNotNullOrEmptyRule(self.name, "El nombre de la opción"))
        self._check_rule(OptionNameValidRule(self.name))
        self._check_rule(NonNegativeAmountRule(self.extra_price, "El precio extra de la opción"))
        
        if not self.product_id:
            raise InvalidOptionDataException('product_id', 'Se requiere product_id')

    def update_name(self, new_name: str):
        """Actualiza el nombre de la opción con validación"""
        from menu.domain.shared.rules import OptionNameValidRule, StringNotNullOrEmptyRule
        
        self._check_rule(StringNotNullOrEmptyRule(new_name, "El nombre de la opción"))
        self._check_rule(OptionNameValidRule(new_name))
        self.name = new_name.strip()
        return self
    
    def update_extra_price(self, new_extra_price: Decimal):
        """Actualiza el precio extra con validación"""
        from menu.domain.shared.rules import NonNegativeAmountRule
        
        self._check_rule(NonNegativeAmountRule(new_extra_price, "El precio extra de la opción"))
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