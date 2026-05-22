"""
Repositories - Acceso a datos para las entidades de dominio
"""
from decimal import Decimal
from datetime import datetime 
from typing import List, Optional
from .models import Category as CategoryModel
from .models import Product as ProductModel
from .models import ProductOption as ProductOptionModel
from ..domain.entities import Category, Product, ProductOption


class CategoryRepository:
    """Repositorio para operaciones con Categorías"""
    
    @staticmethod
    def get_by_id(category_id: int, restaurant_id: int) -> Optional[Category]:
        try:
            model = CategoryModel.objects.get(id=category_id, restaurant_id=restaurant_id)
            return Category(
                id=model.id,
                name=model.name,
                restaurant_id=model.restaurant_id,
            )
        except CategoryModel.DoesNotExist:
            return None
    
    @staticmethod
    def list_by_restaurant(restaurant_id: int) -> List[Category]:
        queryset = CategoryModel.objects.filter(restaurant_id=restaurant_id)
        return [
            Category(
                id=cat.id,
                name=cat.name,
                restaurant_id=cat.restaurant_id,
            )
            for cat in queryset
        ]
    
    @staticmethod
    def create(name: str, restaurant_id: int) -> Category:
        model = CategoryModel.objects.create(
            name=name,
            restaurant_id=restaurant_id,
        )
        return Category(
            id=model.id,
            name=model.name,
            restaurant_id=model.restaurant_id,
        )
    
    @staticmethod
    def update(category_id: int, restaurant_id: int, name: str) -> Optional[Category]:
        try:
            model = CategoryModel.objects.get(id=category_id, restaurant_id=restaurant_id)
            model.name = name
            model.save()
            return Category(
                id=model.id,
                name=model.name,
                restaurant_id=model.restaurant_id,
            )
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


class ProductRepository:
    """Repositorio para operaciones con Productos"""
    
    @staticmethod
    def get_by_id(product_id: int, restaurant_id: int) -> Optional[Product]:
        try:
            model = ProductModel.objects.get(id=product_id, restaurant_id=restaurant_id)
            return Product(
                id=model.id,
                name=model.name,
                price=model.price,
                category_id=model.category_id,
                restaurant_id=model.restaurant_id,
                image=model.image,
                description=model.description,
            )
        except ProductModel.DoesNotExist:
            return None
    
    @staticmethod
    def list_by_restaurant(restaurant_id: int) -> List[Product]:
        queryset = ProductModel.objects.filter(restaurant_id=restaurant_id)
        return [
            Product(
                id=p.id,
                name=p.name,
                price=p.price,
                category_id=p.category_id,
                restaurant_id=p.restaurant_id,
                image=p.image,
                description=p.description,
            )
            for p in queryset
        ]
    
    @staticmethod
    def create(name: str, price: Decimal, category_id: int, restaurant_id: int,
               image: str = None, description: str = None) -> Product:
        model = ProductModel.objects.create(
            name=name,
            price=price,
            category_id=category_id,
            restaurant_id=restaurant_id,
            image=image,
            description=description,
        )
        return Product(
            id=model.id,
            name=model.name,
            price=model.price,
            category_id=model.category_id,
            restaurant_id=model.restaurant_id,
            image=model.image,
            description=model.description,
        )
    
    @staticmethod
    def update(product_id: int, restaurant_id: int, **kwargs) -> Optional[Product]:
        try:
            model = ProductModel.objects.get(id=product_id, restaurant_id=restaurant_id)
            for key, value in kwargs.items():
                if hasattr(model, key) and value is not None:
                    setattr(model, key, value)
            model.save()
            return Product(
                id=model.id,
                name=model.name,
                price=model.price,
                category_id=model.category_id,
                restaurant_id=model.restaurant_id,
                image=model.image,
                description=model.description,
            )
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
    def update_with_image(product_id: int, restaurant_id: int, image_file, **kwargs):
        """Actualiza un producto con una imagen - guarda la URL"""
        try:
            from django.core.files.storage import default_storage
            import os
            
            model = ProductModel.objects.get(id=product_id, restaurant_id=restaurant_id)
            
            # Actualizar campos
            for key, value in kwargs.items():
                if hasattr(model, key) and value is not None:
                    setattr(model, key, value)
            
            # Guardar la imagen y obtener la URL
            ext = os.path.splitext(image_file.name)[1]
            filename = f"products/product_{product_id}_{datetime.now().timestamp()}{ext}"
            saved_path = default_storage.save(filename, image_file)
            
            # Guardar la URL en el campo image (CharField)
            model.image = default_storage.url(saved_path)
            model.save()
            
            return Product(
                id=model.id,
                name=model.name,
                price=model.price,
                category_id=model.category_id,
                restaurant_id=model.restaurant_id,
                image=model.image,
                description=model.description,
            )
        except ProductModel.DoesNotExist:
            return None
        
    @staticmethod
    def create_with_image(name: str, price: Decimal, category_id: int, restaurant_id: int, image_file, description: str = None) -> Product:
        """Crea un producto con imagen - guarda la URL"""
        from django.core.files.storage import default_storage
        import os
        
        # Crear el producto primero sin imagen
        product = ProductRepository.create(
            name=name,
            price=price,
            category_id=category_id,
            restaurant_id=restaurant_id,
            description=description
        )
        
        # Guardar la imagen y obtener la URL
        if image_file:
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


class ProductOptionRepository:
    """Repositorio para operaciones con Opciones de Producto"""
    
    @staticmethod
    def get_by_id(option_id: int, restaurant_id: int) -> Optional[ProductOption]:
        try:
            model = ProductOptionModel.objects.get(id=option_id, product__restaurant_id=restaurant_id)
            return ProductOption(
                id=model.id,
                name=model.name,
                extra_price=model.extra_price,
                product_id=model.product_id,
            )
        except ProductOptionModel.DoesNotExist:
            return None
    
    @staticmethod
    def list_by_product(product_id: int, restaurant_id: int) -> List[ProductOption]:
        queryset = ProductOptionModel.objects.filter(
            product_id=product_id,
            product__restaurant_id=restaurant_id
        )
        return [
            ProductOption(
                id=opt.id,
                name=opt.name,
                extra_price=opt.extra_price,
                product_id=opt.product_id,
            )
            for opt in queryset
        ]
    
    @staticmethod
    def create(name: str, extra_price: Decimal, product_id: int) -> ProductOption:
        model = ProductOptionModel.objects.create(
            name=name,
            extra_price=extra_price,
            product_id=product_id,
        )
        return ProductOption(
            id=model.id,
            name=model.name,
            extra_price=model.extra_price,
            product_id=model.product_id,
        )
    
    @staticmethod
    def update(option_id: int, restaurant_id: int, **kwargs) -> Optional[ProductOption]:
        try:
            model = ProductOptionModel.objects.get(id=option_id, product__restaurant_id=restaurant_id)
            for key, value in kwargs.items():
                if hasattr(model, key) and value is not None:
                    setattr(model, key, value)
            model.save()
            return ProductOption(
                id=model.id,
                name=model.name,
                extra_price=model.extra_price,
                product_id=model.product_id,
            )
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