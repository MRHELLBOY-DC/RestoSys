from dataclasses import dataclass
from decimal import Decimal
from typing import Optional
from menu.domain.shared import AggregateRoot
from menu.domain.exceptions import InvalidProductDataException


@dataclass(kw_only=True)
class Product(AggregateRoot):
    name: str
    price: Decimal
    category_id: int
    restaurant_id: int
    id: Optional[int] = None
    image: Optional[str] = None
    description: Optional[str] = None

    def __post_init__(self):
        """Validaciones automáticas al crear la instancia"""
        self._domain_events = []
        self._validate()

    def _validate(self):
        """
        Valida las reglas de negocio del Product.
        Estas validaciones se ejecutan automáticamente al crear o reconstituir un Product.
        """
        from menu.domain.shared.rules import (
            StringNotNullOrEmptyRule,
            ProductNameValidRule,
            PositiveAmountRule
        )
        
        self._check_rule(StringNotNullOrEmptyRule(self.name, "El nombre del producto"))
        self._check_rule(ProductNameValidRule(self.name))
        self._check_rule(PositiveAmountRule(self.price, "El precio del producto"))
        
        if not self.category_id:
            raise InvalidProductDataException('category_id', 'Se requiere category_id')
        
        if not self.restaurant_id:
            raise InvalidProductDataException('restaurant_id', 'Se requiere restaurant_id')

    def update_name(self, new_name: str):
        """Actualiza el nombre del producto con validación"""
        from menu.domain.shared.rules import ProductNameValidRule, StringNotNullOrEmptyRule
        
        self._check_rule(StringNotNullOrEmptyRule(new_name, "El nombre del producto"))
        self._check_rule(ProductNameValidRule(new_name))
        self.name = new_name.strip()
        return self
    
    def update_price(self, new_price: Decimal):
        """Actualiza el precio del producto con validación"""
        from menu.domain.shared.rules import PositiveAmountRule
        
        self._check_rule(PositiveAmountRule(new_price, "El precio del producto"))
        self.price = new_price
        return self
    
    def update_description(self, new_description: Optional[str]):
        """Actualiza la descripción"""
        self.description = new_description
        return self
    
    def update_image(self, new_image: Optional[str]):
        """Actualiza la URL de la imagen"""
        self.image = new_image
        return self

    def record_created(self):
        return self.add_domain_event('ProductCreated', {
            'product_id': self.id,
            'name': self.name,
            'price': str(self.price),
            'category_id': self.category_id,
            'restaurant_id': self.restaurant_id,
            'image': self.image,
            'description': self.description,
        }, aggregate_type='Product')