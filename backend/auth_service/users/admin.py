from django.contrib import admin
from .models import User, Event, Restaurant, UserRestaurant

admin.site.register(User)
admin.site.register(Restaurant)
admin.site.register(UserRestaurant)
admin.site.register(Event)