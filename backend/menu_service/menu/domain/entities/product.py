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
        self._validate_name()
        self._validate_price()
        self._validate_category_id()
        self._validate_restaurant_id()

    def _validate_name(self):
        """Valida que el nombre no esté vacío"""
        if not self.name or not self.name.strip():
            raise InvalidProductDataException('name', 'El nombre del producto es requerido')
    
    def _validate_price(self):
        """Valida que el precio sea mayor a 0"""
        if self.price <= 0:
            raise InvalidProductDataException('price', 'El precio debe ser mayor a 0')
    
    def _validate_category_id(self):
        """Valida que category_id esté presente"""
        if not self.category_id:
            raise InvalidProductDataException('category_id', 'Se requiere category_id')
    
    def _validate_restaurant_id(self):
        """Valida que restaurant_id esté presente"""
        if not self.restaurant_id:
            raise InvalidProductDataException('restaurant_id', 'Se requiere restaurant_id')
    
    def update_name(self, new_name: str):
        """Actualiza el nombre del producto con validación"""
        if not new_name or not new_name.strip():
            raise InvalidProductDataException('name', 'El nombre no puede estar vacío')
        self.name = new_name.strip()
        return self
    
    def update_price(self, new_price: Decimal):
        """Actualiza el precio del producto con validación"""
        if new_price <= 0:
            raise InvalidProductDataException('price', 'El precio debe ser mayor a 0')
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