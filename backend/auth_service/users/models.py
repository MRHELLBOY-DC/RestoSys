from django.contrib.auth.models import AbstractUser
from django.db import models

# 👤 USUARIO
class User(AbstractUser):
    ROLE_CHOICES = (
        ('cliente', 'Cliente'),
        ('admin', 'Admin'),
        ('restaurante', 'Restaurante'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cliente')


# 🏢 RESTAURANTE
class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)

    def __str__(self):
        return self.name


# 🔗 RELACIÓN USUARIO - RESTAURANTE (multi-tenant)
class UserRestaurant(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.restaurant.name}"

class Event(models.Model):
    """
    Event Store - Almacena todos los eventos del sistema
    Implementa Event Sourcing
    """
    type = models.CharField(max_length=100)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Campos adicionales para Event Sourcing
    aggregate_id = models.CharField(max_length=100, blank=True, null=True)
    aggregate_type = models.CharField(max_length=50, blank=True, null=True)
    version = models.IntegerField(default=1)
    metadata = models.JSONField(blank=True, default=dict)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['aggregate_id']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.type} - {self.aggregate_id}"