"""
API Views - Capa de Interfaces
SOLO orquestan: reciben request, llaman a commands/queries, retornan response.
NO contienen lógica de negocio.
"""

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
from datetime import datetime
from users.infrastructure.container import container
from users.domain.exceptions import InvalidCredentialsException

# Importar serializers (solo para validación de entrada/salida)
from users.interfaces.serializers import (
    UserSerializer,
    UserUpdateSerializer,
    UserReadSerializer,
    RestaurantSerializer,
)

# Importar Commands y Queries (objetos CQRS)
from users.application.commands.create_user import CreateUserCommand
from users.application.commands.update_user import UpdateUserCommand
from users.application.commands.delete_user import DeleteUserCommand
from users.application.commands.create_restaurant import CreateRestaurantCommand
from users.application.commands.update_restaurant import UpdateRestaurantCommand
from users.application.commands.delete_restaurant import DeleteRestaurantCommand
from users.application.commands.assign_restaurant import AssignRestaurantCommand
from users.application.commands.unassign_restaurant import UnassignRestaurantCommand
from users.application.commands.login import LoginCommand 
from users.application.queries import (
    ListUsersQuery,
    GetUserDetailsQuery,
    GetUserEventsQuery,
    GetAllEventsQuery,
    GetUserRestaurantQuery,
    ListRestaurantsQuery,
)

# Importar mappers (solo para convertir entre Django y dominio)
from users.infrastructure.mappers.user_mapper import UserMapper


# ============================================
# REGISTER VIEW - USANDO COMMAND BUS
# ============================================
class RegisterView(generics.CreateAPIView):
    """Registro de nuevos usuarios - Usa CommandBus"""
    
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        # Validar y guardar logo si existe (lógica de presentación SOLO)
        if 'restaurant_logo' in request.FILES:
            logo_file = request.FILES['restaurant_logo']
            
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
            if logo_file.content_type not in allowed_types:
                return Response(
                    {'error': 'Formato de imagen no válido. Use JPG, PNG o WEBP'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if logo_file.size > 2 * 1024 * 1024:
                return Response(
                    {'error': 'La imagen no puede superar los 2MB'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            extension = os.path.splitext(logo_file.name)[1]
            filename = f"restaurantes_logos/logo_{timestamp}_{logo_file.name}"
            
            saved_path = default_storage.save(filename, ContentFile(logo_file.read()))
            logo_url = f"{settings.MEDIA_URL}{saved_path}"
            
            request.data._mutable = True
            request.data['restaurant_logo'] = logo_url
            request.data._mutable = False
        
        # Validar serializer (validaciones de formato)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Obtener datos validados
        validated_data = serializer.validated_data
        password = validated_data.pop('password', '')
        
        # Extraer datos de restaurante
        restaurant_name = validated_data.pop('restaurant_name', None)
        restaurant_address = validated_data.pop('restaurant_address', None)
        restaurant_logo = validated_data.pop('restaurant_logo', None)
        
        # Determinar el rol
        role = validated_data.get('role', 'cliente')
        
        try:
            # Crear el comando para el usuario
            command = CreateUserCommand(
                email=validated_data['email'],
                password=password,
                username=validated_data.get('username'),
                role=role,
                full_name=validated_data.get('full_name', ''),
                actor_username=None
            )
            
            # Ejecutar comando para crear el usuario
            saved_user = container.execute_command(command)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Retornar respuesta
        return Response({
            'id': saved_user.id,
            'username': saved_user.username,
            'email': saved_user.email,
            'role': saved_user.role,
            'full_name': saved_user.full_name,
        }, status=status.HTTP_201_CREATED)
    
# ============================================
# UPDATE USER VIEW - USANDO COMMAND BUS
# ============================================
class UpdateUserView(generics.UpdateAPIView):
    """Actualización de usuarios - Usa CommandBus"""
    
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        django_user = self.get_object()
        
        # Crear command
        command = UpdateUserCommand(
            user_id=django_user.id,
            username=serializer.validated_data.get('username'),
            email=serializer.validated_data.get('email'),
            role=serializer.validated_data.get('role'),
            full_name=serializer.validated_data.get('full_name'),
            actor_username=self.request.user.username
        )
        
        try:
            # Ejecutar command a través del bus
            updated_user = container.execute_command(command)
            
            # Actualizar el modelo Django manualmente
            django_user.username = updated_user.username
            django_user.email = updated_user.email
            django_user.role = updated_user.role
            django_user.full_name = updated_user.full_name
            django_user.save()
            
        except Exception as e:
            raise serializers.ValidationError(str(e))


# ============================================
# DELETE USER VIEW - USANDO COMMAND BUS
# ============================================
class DeleteUserView(generics.DestroyAPIView):
    """Eliminación (soft delete) de usuarios - Usa CommandBus"""
    
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        # Crear command
        command = DeleteUserCommand(
            user_id=instance.id,
            actor_username=self.request.user.username
        )
        
        try:
            container.execute_command(command)
        except Exception as e:
            raise serializers.ValidationError(str(e))


# ============================================
# PROFILE - USANDO QUERY BUS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Perfil del usuario autenticado"""
    
    django_user = request.user
    domain_user = UserMapper.to_domain(django_user)
    
    # Usar QueryBus
    query = GetUserRestaurantQuery(user_id=domain_user.id)
    restaurant_dto = container.execute_query(query)

    return Response({
        'id': domain_user.id,
        'username': domain_user.username,
        'email': domain_user.email,
        'role': domain_user.role,
        'full_name': domain_user.full_name,
        'restaurant': restaurant_dto.to_dict() if restaurant_dto else None,
        'date_joined': domain_user.date_joined,
        'last_login': domain_user.last_login,
    })


# ============================================
# USERS LIST - USANDO QUERY BUS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    """Lista de usuarios (con filtro por rol)"""
    
    role = request.query_params.get('role')
    
    # Usar QueryBus
    query = ListUsersQuery(role=role)
    users = container.execute_query(query)

    return Response({
        'count': len(users),
        'users': [u.to_dict() for u in users]
    })


# ============================================
# USER DETAIL - USANDO QUERY BUS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    """Detalle de un usuario específico"""
    
    # Usar QueryBus
    query = GetUserDetailsQuery(user_id=user_id)
    
    try:
        user = container.execute_query(query)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(user.to_dict())


# ============================================
# EVENT HISTORY - USANDO QUERY BUS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_history(request):
    """Historial de eventos"""
    
    user_id = request.query_params.get('user_id')
    event_type = request.query_params.get('type')
    limit = int(request.query_params.get('limit', 100))
    
    if user_id:
        query = GetUserEventsQuery(user_id=int(user_id), event_type=event_type, limit=limit)
    else:
        query = GetAllEventsQuery(limit=limit)
    
    events = container.execute_query(query)
    
    return Response({
        'count': len(events),
        'events': [e.to_dict() for e in events],
    })


# ============================================
# LOGIN - USANDO USE CASE
# ============================================
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login de usuarios - Usa LoginCommand"""
    
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')
    
    command = LoginCommand(
        email=email,
        username=username,
        password=password
    )
    
    try:
        result = container.execute_command(command)
        return Response(result)
    except InvalidCredentialsException as e:
        return Response(
            {'success': False, 'message': str(e)},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        return Response(
            {'success': False, 'message': str(e)},
            status=status.HTTP_401_UNAUTHORIZED
        )

# ============================================
# PUBLIC ENDPOINTS
# ============================================

@api_view(['GET'])
@permission_classes([AllowAny])
def public_restaurantes(request):
    """Endpoint público para obtener todos los restaurantes"""
    
    # Usar query bus
    query = ListRestaurantsQuery()
    restaurants = container.execute_query(query)
    return Response([r.to_dict() for r in restaurants])


# ============================================
# ADMIN RESTAURANTES - USANDO COMMAND BUS
# ============================================
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_restaurantes(request):
    """Administración de restaurantes - Usa CommandBus"""
    
    if request.method == 'GET':
        query = ListRestaurantsQuery()
        restaurants = container.execute_query(query)
        return Response([r.to_dict() for r in restaurants])
    
    serializer = RestaurantSerializer(data=request.data)
    if serializer.is_valid():
        try:
            command = CreateRestaurantCommand(
                name=serializer.validated_data['name'],
                address=serializer.validated_data.get('address', ''),
                logo=serializer.validated_data.get('logo'),
                actor_username=request.user.username
            )
            saved = container.execute_command(command)
            return Response({
                'id': saved.id,
                'name': saved.name,
                'address': saved.address,
                'logo': saved.logo,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_restaurante_detail(request, restaurante_id):
    """Detalle, actualización y eliminación de restaurante - Usa CommandBus"""
    
    if request.method == 'GET':
        # Usar query existente para obtener restaurante
        query = GetUserRestaurantQuery(user_id=restaurante_id)
        restaurant_dto = container.execute_query(query)
        if restaurant_dto is None:
            return Response({'error': 'Restaurante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(restaurant_dto.to_dict())
    
    if request.method == 'PUT':
        serializer = RestaurantSerializer(data=request.data)
        if serializer.is_valid():
            try:
                command = UpdateRestaurantCommand(
                    restaurant_id=restaurante_id,
                    name=serializer.validated_data.get('name'),
                    address=serializer.validated_data.get('address', ''),
                    logo=serializer.validated_data.get('logo'),
                    actor_username=request.user.username
                )
                saved = container.execute_command(command)
                return Response({
                    'id': saved.id,
                    'name': saved.name,
                    'address': saved.address,
                    'logo': saved.logo,
                })
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # DELETE
    try:
        command = DeleteRestaurantCommand(
            restaurant_id=restaurante_id,
            actor_username=request.user.username
        )
        container.execute_command(command)
        return Response({'message': 'Restaurante eliminado'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


# ============================================
# ADMIN USUARIOS - USANDO COMMAND BUS
# ============================================
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_usuarios(request):
    """Administración de usuarios (admin)"""
    
    if request.method == 'GET':
        query = ListUsersQuery()
        users = container.execute_query(query)
        serializer = UserReadSerializer(users, many=True)
        return Response(serializer.data)
    
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        validated_data = serializer.validated_data
        password = validated_data.pop('password', '')
        
        try:
            # Usar CommandBus para crear usuario
            command = CreateUserCommand(
                email=validated_data['email'],
                password=password,
                username=validated_data.get('username'),
                role=validated_data.get('role', 'cliente'),
                full_name=validated_data.get('full_name', ''),
                actor_username=request.user.username
            )
            saved_user = container.execute_command(command)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        restaurante_id = request.data.get('restaurante_id')
        if restaurante_id:
            # Usar Command para asignar restaurante
            assign_command = AssignRestaurantCommand(
                user_id=saved_user.id,
                restaurant_id=restaurante_id,
                actor_username=request.user.username
            )
            container.execute_command(assign_command)
        
        return Response(UserReadSerializer(saved_user).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# ADMIN USUARIO DETAIL - USANDO COMMAND BUS
# ============================================
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_usuario_detail(request, usuario_id):
    """Detalle, actualización y eliminación de usuario (admin)"""
    
    if request.method == 'GET':
        query = GetUserDetailsQuery(user_id=usuario_id)
        try:
            user = container.execute_query(query)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserReadSerializer(user)
        return Response(serializer.data)
    
    if request.method == 'PUT':
        query = GetUserDetailsQuery(user_id=usuario_id)
        try:
            user = container.execute_query(query)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        
        old_data = {
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
        
        serializer = UserUpdateSerializer(user, data=request.data)
        if serializer.is_valid():
            try:
                command = UpdateUserCommand(
                    user_id=usuario_id,
                    username=serializer.validated_data.get('username'),
                    email=serializer.validated_data.get('email'),
                    role=serializer.validated_data.get('role'),
                    full_name=serializer.validated_data.get('full_name'),
                    actor_username=request.user.username
                )
                updated_user = container.execute_command(command)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            restaurante_id = request.data.get('restaurante_id')
            if restaurante_id is not None:
                if restaurante_id:
                    assign_command = AssignRestaurantCommand(
                        user_id=updated_user.id,
                        restaurant_id=restaurante_id,
                        actor_username=request.user.username
                    )
                    container.execute_command(assign_command)
                else:
                    unassign_command = UnassignRestaurantCommand(
                        user_id=updated_user.id,
                        actor_username=request.user.username
                    )
                    container.execute_command(unassign_command)
            
            return Response(UserReadSerializer(updated_user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # DELETE
    try:
        command = DeleteUserCommand(
            user_id=usuario_id,
            actor_username=request.user.username
        )
        container.execute_command(command)
        return Response({'message': 'Usuario eliminado'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


# ============================================
# ADMIN ASIGNAR RESTAURANTE - USANDO COMMAND BUS
# ============================================
@api_view(['POST', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_asignar_restaurante(request, usuario_id):
    """Asignar o desasignar restaurante a un usuario - Usa CommandBus"""
    
    if request.method == 'POST':
        restaurante_id = request.data.get('restaurante_id')
        if not restaurante_id:
            return Response(
                {'error': 'Se requiere restaurante_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            command = AssignRestaurantCommand(
                user_id=usuario_id,
                restaurant_id=restaurante_id,
                actor_username=request.user.username
            )
            container.execute_command(command)
            return Response({'message': 'Usuario asignado correctamente'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    # DELETE - Desasignar
    try:
        command = UnassignRestaurantCommand(
            user_id=usuario_id,
            actor_username=request.user.username
        )
        container.execute_command(command)
        return Response({'message': 'Usuario desasignado de su restaurante'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)