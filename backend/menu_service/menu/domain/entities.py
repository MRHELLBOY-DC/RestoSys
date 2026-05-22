"""
Domain Entities - Modelos de dominio puros (sin dependencias de Django)
"""
from dataclasses import dataclass
from typing import Optional, List
from decimal import Decimal


@dataclass
class Category:
    """Entidad de dominio: Categoría"""
    id: Optional[int]
    name: str
    restaurant_id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


@dataclass
class Product:
    """Entidad de dominio: Producto"""
    id: Optional[int]
    name: str
    price: Decimal
    category_id: int
    restaurant_id: int
    image: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


@dataclass
class ProductOption:
    """Entidad de dominio: Opción de producto (extras)"""
    id: Optional[int]
    name: str
    extra_price: Decimal
    product_id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None