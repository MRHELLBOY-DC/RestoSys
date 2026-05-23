from django.db import models

from users.domain.shared import EntityMixin


class Restaurant(EntityMixin, models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    logo = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.name
