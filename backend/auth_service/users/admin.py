from django.contrib import admin
from users.infrastructure.models import User, Event, Restaurant, UserRestaurant


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Administración personalizada para Usuarios"""
    list_display = ('id', 'username', 'email', 'role', 'full_name', 'is_active', 'date_joined')
    list_display_links = ('id', 'username')
    list_filter = ('role', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'full_name')
    readonly_fields = ('date_joined', 'last_login')
    fieldsets = (
        ('Información de usuario', {
            'fields': ('username', 'email', 'password', 'full_name', 'role')
        }),
        ('Estado', {
            'fields': ('is_active',)
        }),
        ('Fechas', {
            'fields': ('date_joined', 'last_login'),
            'classes': ('collapse',)
        }),
    )
    ordering = ('-date_joined',)


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    """Administración personalizada para Restaurantes"""
    list_display = ('id', 'name', 'address', 'logo')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'address')
    ordering = ('name',)


@admin.register(UserRestaurant)
class UserRestaurantAdmin(admin.ModelAdmin):
    """Administración personalizada para Asignaciones Usuario-Restaurante"""
    list_display = ('id', 'user', 'restaurant')
    list_display_links = ('id',)
    list_filter = ('restaurant',)
    search_fields = ('user__username', 'user__email', 'restaurant__name')
    raw_id_fields = ('user', 'restaurant')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Administración personalizada para Eventos"""
    list_display = ('id', 'type', 'aggregate_id', 'aggregate_type', 'version', 'created_at')
    list_display_links = ('id',)
    list_filter = ('type', 'aggregate_type', 'created_at')
    search_fields = ('type', 'aggregate_id', 'data')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)