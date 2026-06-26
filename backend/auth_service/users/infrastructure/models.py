"""
Modelos de persistencia para Django ORM
Estos son los modelos REALES que Django utiliza para las migraciones.
NO confundir con las entidades de dominio.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Modelo ORM para usuarios - Django REAL.
    NO usar directamente en dominio. Usar el mapper.
    """
    ROLE_CHOICES = (
        ('cliente', 'Cliente'),
        ('admin', 'Super Administrador'),
        ('restaurante', 'Administrador de Restaurante'),
        ('empleado', 'Empleado'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cliente')
    full_name = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'users_user'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.username


class Restaurant(models.Model):
    """Modelo ORM para restaurantes - Django REAL"""
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    logo = models.CharField(max_length=500, blank=True, null=True)

    class Meta:
        db_table = 'users_restaurant'
        verbose_name = 'Restaurante'
        verbose_name_plural = 'Restaurantes'

    def __str__(self):
        return self.name


class UserRestaurant(models.Model):
    """Modelo ORM para relación usuario-restaurante - Django REAL"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    class Meta:
        db_table = 'users_user_restaurant'
        verbose_name = 'Asignación usuario-restaurante'
        verbose_name_plural = 'Asignaciones usuario-restaurante'
        unique_together = [['user', 'restaurant']]

    def __str__(self):
        return f"{self.user.username} - {self.restaurant.name}"


class Event(models.Model):
    """Modelo ORM para eventos - Django REAL"""
    type = models.CharField(max_length=100)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    aggregate_id = models.CharField(max_length=100, blank=True, null=True)
    aggregate_type = models.CharField(max_length=50, blank=True, null=True)
    version = models.IntegerField(default=1)
    metadata = models.JSONField(blank=True, default=dict)

    class Meta:
        db_table = 'users_event'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['aggregate_id']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Evento'
        verbose_name_plural = 'Eventos'

    def __str__(self):
        return f"{self.type} - {self.aggregate_id}"