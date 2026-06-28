"""
Repositories - Acceso a datos para las entidades de dominio
Implementan los puertos definidos en application/ports/
"""
from decimal import Decimal
from typing import Optional, List
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import UploadedFile
import os
from datetime import datetime

from .models import Category as CategoryModel
from .models import Product as ProductModel
from .models import ProductOption as ProductOptionModel
from .mappers import CategoryMapper, ProductMapper, OptionMapper
from ..domain.entities import Category, Product, ProductOption

# Importar puertos
from ..application.ports.category_repository_port import CategoryRepositoryPort
from ..application.ports.product_repository_port import ProductRepositoryPort
from ..application.ports.option_repository_port import OptionRepositoryPort


class CategoryRepository(CategoryRepositoryPort):
    """Repositorio para operaciones con Categorías - Implementa CategoryRepositoryPort"""
    
    @staticmethod
    def get_by_id(category_id: int, restaurant_id: int) -> Optional[Category]:
        try:
            model = CategoryModel.objects.get(id=category_id, restaurant_id=restaurant_id)
            return CategoryMapper.to_domain(model)
        except CategoryModel.DoesNotExist:
            return None
    
    @staticmethod
    def list_by_restaurant(restaurant_id: int) -> List[Category]:
        queryset = CategoryModel.objects.filter(restaurant_id=restaurant_id)
        return CategoryMapper.to_domain_list(queryset)
    
    @staticmethod
    def create(name: str, restaurant_id: int) -> Category:
        model = CategoryModel.objects.create(
            name=name,
            restaurant_id=restaurant_id,
        )
        return CategoryMapper.to_domain(model)
    
    @staticmethod
    def update(category_id: int, restaurant_id: int, name: str) -> Optional[Category]:
        try:
            model = CategoryModel.objects.get(id=category_id, restaurant_id=restaurant_id)
            model.name = name
            model.save()
            return CategoryMapper.to_domain(model)
        except CategoryModel.DoesNotExist:
            return None
    
    @staticmethod
    def delete(category_id: int, restaurant_id: int) -> bool:
        try:
            model = CategoryModel.objects.get(id=category_id, restaurant_id=restaurant_id)
            model.delete()
            return True
        except CategoryModel.DoesNotExist:
            return False


class ProductRepository(ProductRepositoryPort):
    """Repositorio para operaciones con Productos - Implementa ProductRepositoryPort"""
    
    @staticmethod
    def get_by_id(product_id: int, restaurant_id: int) -> Optional[Product]:
        try:
            model = ProductModel.objects.get(id=product_id, restaurant_id=restaurant_id)
            return ProductMapper.to_domain(model)
        except ProductModel.DoesNotExist:
            return None
    
    @staticmethod
    def list_by_restaurant(restaurant_id: int) -> List[Product]:
        queryset = ProductModel.objects.filter(restaurant_id=restaurant_id)
        return ProductMapper.to_domain_list(queryset)
    
    @staticmethod
    def list_by_category(category_id: int, restaurant_id: int) -> List[Product]:
        """
        Obtiene todos los productos de una categoría específica.
        """
        queryset = ProductModel.objects.filter(
            category_id=category_id,
            restaurant_id=restaurant_id
        )
        return ProductMapper.to_domain_list(queryset)
    
    @staticmethod
    def count_by_category(category_id: int, restaurant_id: int) -> int:
        """
        Cuenta cuántos productos tiene una categoría.
        """
        return ProductModel.objects.filter(
            category_id=category_id,
            restaurant_id=restaurant_id
        ).count()
    
    @staticmethod
    def create(name: str, price: Decimal, category_id: int, restaurant_id: int,
               image: Optional[str] = None, description: Optional[str] = None) -> Product:
        model = ProductModel.objects.create(
            name=name,
            price=price,
            category_id=category_id,
            restaurant_id=restaurant_id,
            image=image,
            description=description,
        )
        return ProductMapper.to_domain(model)
    
    @staticmethod
    def update(product_id: int, restaurant_id: int, **kwargs) -> Optional[Product]:
        try:
            model = ProductModel.objects.get(id=product_id, restaurant_id=restaurant_id)
            for key, value in kwargs.items():
                if hasattr(model, key) and value is not None:
                    setattr(model, key, value)
            model.save()
            return ProductMapper.to_domain(model)
        except ProductModel.DoesNotExist:
            return None
    
    @staticmethod
    def delete(product_id: int, restaurant_id: int) -> bool:
        try:
            model = ProductModel.objects.get(id=product_id, restaurant_id=restaurant_id)
            model.delete()
            return True
        except ProductModel.DoesNotExist:
            return False
    
    @staticmethod
    def update_with_image(product_id: int, restaurant_id: int, image_file: UploadedFile, **kwargs) -> Optional[Product]:
        """Actualiza un producto con una imagen - guarda la URL"""
        try:
            model = ProductModel.objects.get(id=product_id, restaurant_id=restaurant_id)
            
            # Actualizar campos
            for key, value in kwargs.items():
                if hasattr(model, key) and value is not None:
                    setattr(model, key, value)
            
            # Guardar la imagen y obtener la URL
            ext = os.path.splitext(image_file.name)[1]
            filename = f"products/product_{product_id}_{datetime.now().timestamp()}{ext}"
            saved_path = default_storage.save(filename, image_file)
            model.image = default_storage.url(saved_path)
            model.save()
            
            return ProductMapper.to_domain(model)
        except ProductModel.DoesNotExist:
            return None
    
    @staticmethod
    def create_with_image(name: str, price: Decimal, category_id: int, restaurant_id: int,
                          image_file: UploadedFile, description: Optional[str] = None) -> Optional[Product]:
        """Crea un producto con imagen - guarda la URL"""
        # Crear el producto primero sin imagen
        product = ProductRepository.create(
            name=name,
            price=price,
            category_id=category_id,
            restaurant_id=restaurant_id,
            description=description
        )
        
        # Guardar la imagen y obtener la URL
        if image_file and product.id:
            ext = os.path.splitext(image_file.name)[1]
            filename = f"products/product_{product.id}_{datetime.now().timestamp()}{ext}"
            saved_path = default_storage.save(filename, image_file)
            image_url = default_storage.url(saved_path)
            
            # Actualizar el producto con la URL de la imagen
            return ProductRepository.update(
                product_id=product.id,
                restaurant_id=restaurant_id,
                image=image_url
            )
        
        return product


class ProductOptionRepository(OptionRepositoryPort):
    """Repositorio para operaciones con Opciones - Implementa OptionRepositoryPort"""
    
    @staticmethod
    def get_by_id(option_id: int, restaurant_id: int) -> Optional[ProductOption]:
        try:
            model = ProductOptionModel.objects.get(id=option_id, product__restaurant_id=restaurant_id)
            return OptionMapper.to_domain(model)
        except ProductOptionModel.DoesNotExist:
            return None
    
    @staticmethod
    def list_by_product(product_id: int, restaurant_id: int) -> List[ProductOption]:
        queryset = ProductOptionModel.objects.filter(
            product_id=product_id,
            product__restaurant_id=restaurant_id
        )
        return OptionMapper.to_domain_list(queryset)
    
    @staticmethod
    def count_by_product(product_id: int, restaurant_id: int) -> int:
        """
        Cuenta cuántas opciones tiene un producto.
        """
        return ProductOptionModel.objects.filter(
            product_id=product_id,
            product__restaurant_id=restaurant_id
        ).count()
    
    @staticmethod
    def create(name: str, extra_price: Decimal, product_id: int) -> ProductOption:
        model = ProductOptionModel.objects.create(
            name=name,
            extra_price=extra_price,
            product_id=product_id,
        )
        return OptionMapper.to_domain(model)
    
    @staticmethod
    def update(option_id: int, restaurant_id: int, **kwargs) -> Optional[ProductOption]:
        try:
            model = ProductOptionModel.objects.get(id=option_id, product__restaurant_id=restaurant_id)
            for key, value in kwargs.items():
                if hasattr(model, key) and value is not None:
                    setattr(model, key, value)
            model.save()
            return OptionMapper.to_domain(model)
        except ProductOptionModel.DoesNotExist:
            return None
    
    @staticmethod
    def delete(option_id: int, restaurant_id: int) -> bool:
        try:
            model = ProductOptionModel.objects.get(id=option_id, product__restaurant_id=restaurant_id)
            model.delete()
            return True
        except ProductOptionModel.DoesNotExist:
            return False