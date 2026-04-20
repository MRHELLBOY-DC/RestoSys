from django.db import models

#  CATEGORÍAS
class Category(models.Model):
    name = models.CharField(max_length=100)
    restaurant_id = models.IntegerField(null=True, blank=True)  #  ID del restaurante (no ForeignKey)

    def __str__(self):
        return self.name


#  PRODUCTOS
class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    restaurant_id = models.IntegerField(null=True, blank=True)  #  ID del restaurante
    image = models.CharField(max_length=500, blank=True, null=True)  # URL de imagen
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


#  OPCIONES (extras)
class ProductOption(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='options')
    name = models.CharField(max_length=100)
    extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.product.name} - {self.name}"