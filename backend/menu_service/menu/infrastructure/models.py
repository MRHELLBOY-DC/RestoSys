"""
Infrastructure Models - Modelos de Django para la base de datos
"""
from django.db import models


class Category(models.Model):
    """Modelo Django para Categoría"""
    name = models.CharField(max_length=100)
    restaurant_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'menu_category'


class Product(models.Model):
    """Modelo Django para Producto"""
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    restaurant_id = models.IntegerField(null=True, blank=True)
    image = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'menu_product'

class ProductOption(models.Model):
    """Modelo Django para Opciones de Producto"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='options')
    name = models.CharField(max_length=100)
    extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.product.name} - {self.name}"
    
    class Meta:
        db_table = 'menu_productoption'

# menu/infrastructure/models.py - Agrega esta clase al final

class Event(models.Model):
    """Modelo para Event Sourcing en menu_service"""
    type = models.CharField(max_length=100)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    aggregate_id = models.CharField(max_length=100, blank=True, null=True)
    aggregate_type = models.CharField(max_length=50, blank=True, null=True)
    version = models.IntegerField(default=1)
    metadata = models.JSONField(blank=True, default=dict)

    class Meta:
        db_table = 'menu_event'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['aggregate_id']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.type} - {self.aggregate_id}"