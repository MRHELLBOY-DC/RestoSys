"""
Re-exportación de modelos para compatibilidad con Django
Los modelos reales están en infrastructure/models.py
"""
from users.infrastructure.models import (
    User,
    Restaurant,
    UserRestaurant,
    Event,
)

__all__ = [
    'User',
    'Restaurant',
    'UserRestaurant',
    'Event',
]