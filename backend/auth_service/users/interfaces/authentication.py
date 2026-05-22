from rest_framework.permissions import IsAuthenticated


class IsRestaurantOrAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        role = getattr(request.user, 'role', None)
        return role in ['restaurante', 'admin']
