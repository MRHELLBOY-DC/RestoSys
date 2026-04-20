from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, UserRestaurant, Restaurant 
from .serializers import UserSerializer, UserUpdateSerializer, UserReadSerializer, RestaurantSerializer
#  IMPORTAR CQRS - COMMANDS
from .commands import (
    create_user_event,
    update_user_event,
    delete_user_event
)

#  IMPORTAR CQRS - QUERIES
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

#  REGISTRO (COMMAND - Create)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        create_user_event(user)


#  ACTUALIZAR USUARIO (COMMAND - Update)
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


#  ELIMINAR USUARIO (COMMAND - Delete - Soft Delete)
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

#  PERFIL MEJORADO (QUERY - Read con restaurante)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    
    # Obtener restaurante del usuario
    restaurant_data = None
    user_restaurant = UserRestaurant.objects.filter(user=user).first()
    if user_restaurant:
        restaurant_data = RestaurantSerializer(user_restaurant.restaurant).data
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'restaurant': restaurant_data,
        'date_joined': user.date_joined,
        'last_login': user.last_login
    })


#  LISTAR USUARIOS (QUERY - Read)
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


#  DETALLES DE USUARIO (QUERY - Read)
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


#  HISTORIAL DE EVENTOS (QUERY - Read)
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


# ============================================
# LOGIN PERSONALIZADO (devuelve usuario + token CON INFORMACIÓN EXTRA)
# ============================================
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user:
        # Generar token JWT
        refresh = RefreshToken.for_user(user)
        
        # Obtener restaurant_id
        restaurant_id = None
        restaurant_data = None
        user_restaurant = UserRestaurant.objects.filter(user=user).first()
        if user_restaurant:
            restaurant_id = user_restaurant.restaurant.id
            restaurant_data = RestaurantSerializer(user_restaurant.restaurant).data
        
        #  AGREGAR INFORMACIÓN EXTRA AL TOKEN (importante para menu_service)
        refresh.payload['user_id'] = str(user.id)
        refresh.payload['username'] = user.username
        refresh.payload['role'] = user.role
        refresh.payload['restaurant_id'] = restaurant_id
        
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'restaurant': restaurant_data,
                'restaurant_id': restaurant_id
            }
        })
    else:
        return Response({
            'success': False,
            'message': 'Credenciales inválidas'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
# ============================================
# ADMIN - CRUD DE RESTAURANTES
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_restaurantes(request):
    """Listar todos los restaurantes o crear uno nuevo"""
    
    if request.method == 'GET':
        restaurantes = Restaurant.objects.all()
        serializer = RestaurantSerializer(restaurantes, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = RestaurantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_restaurante_detail(request, restaurante_id):
    """Obtener, actualizar o eliminar un restaurante específico"""
    
    try:
        restaurante = Restaurant.objects.get(id=restaurante_id)
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = RestaurantSerializer(restaurante)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = RestaurantSerializer(restaurante, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        restaurante.delete()
        return Response({'message': 'Restaurante eliminado'}, status=status.HTTP_204_NO_CONTENT)


# ============================================
# ADMIN - CRUD DE USUARIOS
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_usuarios(request):
    """Listar todos los usuarios o crear uno nuevo"""
    
    if request.method == 'GET':
        usuarios = User.objects.all()
        serializer = UserReadSerializer(usuarios, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Si se especificó un restaurante, asociarlo
            restaurante_id = request.data.get('restaurante_id')
            if restaurante_id:
                try:
                    restaurante = Restaurant.objects.get(id=restaurante_id)
                    UserRestaurant.objects.create(user=user, restaurant=restaurante)
                except Restaurant.DoesNotExist:
                    pass
            
            return Response(UserReadSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_usuario_detail(request, usuario_id):
    """Obtener, actualizar o eliminar un usuario específico"""
    
    try:
        usuario = User.objects.get(id=usuario_id)
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = UserReadSerializer(usuario)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserUpdateSerializer(usuario, data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            # Actualizar relación con restaurante
            restaurante_id = request.data.get('restaurante_id')
            if restaurante_id:
                UserRestaurant.objects.update_or_create(
                    user=usuario,
                    defaults={'restaurant_id': restaurante_id}
                )
            elif restaurante_id is None:
                UserRestaurant.objects.filter(user=usuario).delete()
            
            return Response(UserReadSerializer(usuario).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        usuario.delete()
        return Response({'message': 'Usuario eliminado'}, status=status.HTTP_204_NO_CONTENT)


# ============================================
# ADMIN - RELACIONAR USUARIO CON RESTAURANTE
# ============================================

@api_view(['POST', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_asignar_restaurante(request, usuario_id):
    """Asignar o desasignar un restaurante a un usuario"""
    
    try:
        usuario = User.objects.get(id=usuario_id)
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    restaurante_id = request.data.get('restaurante_id')
    
    if request.method == 'POST':
        if not restaurante_id:
            return Response({'error': 'Se requiere restaurante_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            restaurante = Restaurant.objects.get(id=restaurante_id)
            UserRestaurant.objects.update_or_create(
                user=usuario,
                defaults={'restaurant': restaurante}
            )
            return Response({'message': f'Usuario {usuario.username} asignado a {restaurante.name}'})
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'DELETE':
        UserRestaurant.objects.filter(user=usuario).delete()
        return Response({'message': f'Usuario {usuario.username} desasignado de su restaurante'})