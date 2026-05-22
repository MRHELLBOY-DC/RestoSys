"""
Custom Permissions para la API de auth_service
"""
from rest_framework.permissions import IsAuthenticated


class IsRestaurantOrAdmin(IsAuthenticated):
    """Permite acceso solo a usuarios con rol restaurante o admin"""
    
    def has_permission(self, request, view):
        # Primero verificar que está autenticado
        if not super().has_permission(request, view):
            return False
        
        # Verificar el rol desde el token
        role = getattr(request.user, 'role', None)
        return role in ['restaurante', 'admin']