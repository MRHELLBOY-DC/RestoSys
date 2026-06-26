"""
Domain models (Value Objects)
"""
from .email import Email
from .username import Username
from .restaurant_name import RestaurantName

__all__ = [
    'Email',
    'Username',
    'RestaurantName',
]