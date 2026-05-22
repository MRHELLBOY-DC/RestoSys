"""
Models - Redirección a infrastructure.models para mantener compatibilidad
"""
from .infrastructure.models import Category, Product, ProductOption

__all__ = ['Category', 'Product', 'ProductOption']