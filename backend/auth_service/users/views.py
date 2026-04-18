from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import User
from .serializers import UserSerializer, UserUpdateSerializer

# 🔥 IMPORTAR CQRS - COMMANDS
from .commands import (
    create_user_event,
    update_user_event,
    delete_user_event
)

# 🔥 IMPORTAR CQRS - QUERIES
from .queries import (
    get_profile,
    get_user_details,
    get_user_by_username,
    list_users,
    list_users_by_role,
    get_user_events,
    get_all_events
)


# ============================================
# COMMANDS - Escritura (Create, Update, Delete)
# ============================================

# 📝 REGISTRO (COMMAND - Create)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        create_user_event(user)


# ✏️ ACTUALIZAR USUARIO (COMMAND - Update)
class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        user = self.get_object()
        old_data = {
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
        
        # Guardar cambios
        updated_user = serializer.save()
        
        new_data = {
            "username": updated_user.username,
            "email": updated_user.email,
            "role": updated_user.role
        }
        
        # Generar evento de actualización
        update_user_event(updated_user, old_data, new_data)


# 🗑️ ELIMINAR USUARIO (COMMAND - Delete - Soft Delete)
class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        # Soft delete: marcar como inactivo
        instance.is_active = False
        instance.save()
        
        # Generar evento de eliminación
        delete_user_event(instance)


# ============================================
# QUERIES - Lectura (Read)
# ============================================

# 🔐 PERFIL (QUERY - Read)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    data = get_profile(request.user)
    return Response(data)


# 📋 LISTAR USUARIOS (QUERY - Read)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    role = request.query_params.get('role')
    
    if role:
        users = list_users_by_role(role)
    else:
        users = list_users()
    
    return Response({
        "count": len(users),
        "users": users
    })


# 👤 DETALLES DE USUARIO (QUERY - Read)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    user = get_user_details(user_id)
    
    if user is None:
        return Response(
            {"error": "Usuario no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    return Response(user)


# 📜 HISTORIAL DE EVENTOS (QUERY - Read)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_history(request):
    user_id = request.query_params.get('user_id')
    event_type = request.query_params.get('type')
    limit = int(request.query_params.get('limit', 100))
    
    if user_id:
        events = get_user_events(user_id, event_type, limit)
    else:
        events = get_all_events(limit)
    
    return Response({
        "count": len(events),
        "events": events
    })