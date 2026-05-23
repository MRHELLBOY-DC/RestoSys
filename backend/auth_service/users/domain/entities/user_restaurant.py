from django.db import models

from users.domain.shared import EntityMixin
from .restaurant import Restaurant
from .user import User


class UserRestaurant(EntityMixin, models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.restaurant.name}"
