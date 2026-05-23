from django.contrib.auth.models import AbstractUser
from django.db import models

from users.domain.shared import AggregateRootMixin


class User(AggregateRootMixin, AbstractUser):
    ROLE_CHOICES = (
        ('cliente', 'Cliente'),
        ('admin', 'Admin'),
        ('restaurante', 'Restaurante'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cliente')
    full_name = models.CharField(max_length=100, blank=True)

    def record_created(self):
        return self.add_domain_event('UserCreated', {
            'user_id': self.id,
            'username': self.username,
            'role': self.role,
            'email': self.email,
            'full_name': self.full_name,
        })

    def record_updated(self, old_data, new_data):
        return self.add_domain_event('UserUpdated', {
            'user_id': self.id,
            'username': self.username,
            'old_data': old_data,
            'new_data': new_data,
        })

    def record_deleted(self):
        return self.add_domain_event('UserDeleted', {
            'user_id': self.id,
            'username': self.username,
            'role': self.role,
            'is_active': self.is_active,
        })
