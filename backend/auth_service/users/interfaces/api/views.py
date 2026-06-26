from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser
import os
from datetime import datetime
from users.infrastructure.container import container
from users.domain.exceptions import InvalidCredentialsException
from users.domain.shared.core import BusinessRuleValidationException

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

from users.infrastructure.mappers.user_mapper import UserMapper


# ============================================
# REGISTER VIEW
# ============================================
class RegisterView(generics.CreateAPIView):
    
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        
        # 1. Validar datos (solo email, password, username, full_name)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 2. Obtener datos validados
        validated_data = serializer.validated_data
        password = validated_data.pop('password', '')
        
        # 3. FORZAR ROL CLIENTE (SEGURIDAD)
        role = 'cliente'
        
        try:
            # 4. Crear comando con rol forzado
            command = CreateUserCommand(
                email=validated_data['email'],
                password=password,
                username=validated_data.get('username'),
                role=role,
                full_name=validated_data.get('full_name', ''),
                actor_username=None
            )
            
            # 5. Ejecutar comando
            saved_user = container.execute_command(command)
            
        except BusinessRuleValidationException as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 6. Retornar respuesta (SOLO datos de usuario)
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
            
        except BusinessRuleValidationException as e:
            raise serializers.ValidationError(str(e))
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
        except BusinessRuleValidationException as e:
            raise serializers.ValidationError(str(e))
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
    """Lista de usuarios con filtros según el rol del usuario autenticado"""
    
    current_user = request.user
    role_filter = request.query_params.get('role')
    
    # ============================================
    # CASO 1: ADMIN (Super Admin) - Ve todos los usuarios
    # ============================================
    if current_user.role == 'admin':
        query = ListUsersQuery(role=role_filter)
        users = container.execute_query(query)
        return Response({
            'count': len(users),
            'users': [u.to_dict() for u in users]
        })
    
    # ============================================
    # CASO 2: CLIENTE - Solo ve su propio perfil
    # ============================================
    if current_user.role == 'cliente':
        query = GetUserDetailsQuery(user_id=current_user.id)
        try:
            user = container.execute_query(query)
            return Response({
                'count': 1,
                'users': [user.to_dict()]
            })
        except BusinessRuleValidationException as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    # ============================================
    # CASO 3: RESTAURANTE (Admin Restaurante) - Ve usuarios de su restaurante
    # ============================================
    if current_user.role == 'restaurante':
        # Obtener el restaurante del usuario
        restaurant_query = GetUserRestaurantQuery(user_id=current_user.id)
        restaurant_dto = container.execute_query(restaurant_query)
        
        if not restaurant_dto:
            return Response(
                {'error': 'No tienes un restaurante asignado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Listar usuarios de ese restaurante
        query = ListUsersQuery(
            role=role_filter,
            restaurant_id=restaurant_dto.id
        )
        users = container.execute_query(query)
        
        return Response({
            'count': len(users),
            'users': [u.to_dict() for u in users]
        })
    
    # ============================================
    # CASO 4: EMPLEADO - Ve usuarios de su restaurante (solo lectura)
    # ============================================
    if current_user.role == 'empleado':
        # Obtener el restaurante del empleado
        restaurant_query = GetUserRestaurantQuery(user_id=current_user.id)
        restaurant_dto = container.execute_query(restaurant_query)
        
        if not restaurant_dto:
            return Response(
                {'error': 'No tienes un restaurante asignado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Listar usuarios de ese restaurante (solo lectura, sin filtro de rol adicional)
        query = ListUsersQuery(
            restaurant_id=restaurant_dto.id
        )
        users = container.execute_query(query)
        
        return Response({
            'count': len(users),
            'users': [u.to_dict() for u in users]
        })
    
    return Response(
        {'error': 'No autorizado'},
        status=status.HTTP_403_FORBIDDEN
    )


# ============================================
# USER DETAIL - USANDO QUERY BUS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    """Detalle de un usuario específico con validación de permisos"""
    
    current_user = request.user
    target_user_id = user_id
    
    # ============================================
    # CASO 1: ADMIN (Super Admin) - Puede ver cualquier usuario
    # ============================================
    if current_user.role == 'admin':
        query = GetUserDetailsQuery(user_id=target_user_id)
        try:
            user = container.execute_query(query)
            return Response(user.to_dict())
        except BusinessRuleValidationException as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    # ============================================
    # CASO 2: CLIENTE - Solo puede verse a sí mismo
    # ============================================
    if current_user.role == 'cliente':
        if current_user.id != target_user_id:
            return Response(
                {'error': 'No tienes permiso para ver este usuario'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        query = GetUserDetailsQuery(user_id=target_user_id)
        try:
            user = container.execute_query(query)
            return Response(user.to_dict())
        except BusinessRuleValidationException as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    # ============================================
    # CASO 3: RESTAURANTE (Admin Restaurante) - Solo usuarios de su restaurante
    # ============================================
    if current_user.role == 'restaurante':
        # Obtener el restaurante del usuario actual
        current_restaurant_query = GetUserRestaurantQuery(user_id=current_user.id)
        current_restaurant = container.execute_query(current_restaurant_query)
        
        if not current_restaurant:
            return Response(
                {'error': 'No tienes un restaurante asignado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener el restaurante del usuario objetivo
        target_restaurant_query = GetUserRestaurantQuery(user_id=target_user_id)
        target_restaurant = container.execute_query(target_restaurant_query)
        
        # Si el usuario objetivo no tiene restaurante o es de otro restaurante
        if not target_restaurant or target_restaurant.id != current_restaurant.id:
            return Response(
                {'error': 'Este usuario no pertenece a tu restaurante'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Si pertenece al mismo restaurante, mostrar detalles
        query = GetUserDetailsQuery(user_id=target_user_id)
        try:
            user = container.execute_query(query)
            return Response(user.to_dict())
        except BusinessRuleValidationException as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    # ============================================
    # CASO 4: EMPLEADO - Solo usuarios de su restaurante (solo lectura)
    # ============================================
    if current_user.role == 'empleado':
        # Obtener el restaurante del empleado
        current_restaurant_query = GetUserRestaurantQuery(user_id=current_user.id)
        current_restaurant = container.execute_query(current_restaurant_query)
        
        if not current_restaurant:
            return Response(
                {'error': 'No tienes un restaurante asignado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener el restaurante del usuario objetivo
        target_restaurant_query = GetUserRestaurantQuery(user_id=target_user_id)
        target_restaurant = container.execute_query(target_restaurant_query)
        
        # Si el usuario objetivo no tiene restaurante o es de otro restaurante
        if not target_restaurant or target_restaurant.id != current_restaurant.id:
            return Response(
                {'error': 'Este usuario no pertenece a tu restaurante'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Si pertenece al mismo restaurante, mostrar detalles
        query = GetUserDetailsQuery(user_id=target_user_id)
        try:
            user = container.execute_query(query)
            return Response(user.to_dict())
        except BusinessRuleValidationException as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(
        {'error': 'No autorizado'},
        status=status.HTTP_403_FORBIDDEN
    )


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
# LOGIN 
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
    except BusinessRuleValidationException as e:
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
# Agregamos esto para que DRF pueda leer archivos y form-data
def admin_restaurantes(request):
    # Forzamos los parsers necesarios para recibir archivos
    parser_classes = [MultiPartParser, FormParser] 
    
    if request.method == 'GET':
        query = ListRestaurantsQuery()
        restaurants = container.execute_query(query)
        return Response([r.to_dict() for r in restaurants])
    
    # --- PROCESAMIENTO POST ---
    # Extraemos manualmente para evitar conflictos con el Serializer
    name = request.data.get('name')
    address = request.data.get('address')
    logo = request.FILES.get('logo') # Django obtiene el archivo aquí
    
    if not name:
        return Response({'error': 'El nombre es obligatorio'}, status=400)

    try:
        command = CreateRestaurantCommand(
            name=name,
            address=address if address else '',
            logo=logo, # Pasamos el objeto archivo directamente
            actor_username=request.user.username
        )
        saved = container.execute_command(command)
        
        return Response({
            'id': saved.id,
            'name': saved.name,
            'address': saved.address,
            'logo': saved.logo,
        }, status=status.HTTP_201_CREATED)
        
    except BusinessRuleValidationException as e:
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


# ============================================
# ADMIN RESTAURANTE DETAIL - USANDO COMMAND BUS
# ============================================
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
# Añadimos los parsers para manejar multipart/form-data
def admin_restaurante_detail(request, restaurante_id):
    """
    Detalle, actualización y eliminación de restaurante
    - Super Admin (admin): Puede cualquier restaurante
    - Admin Restaurante (restaurante): Solo su restaurante (GET, PUT)
    """
    
    current_user = request.user
    
    # ============================================
    # CASO 1: SUPER ADMIN - Puede hacer todo
    # ============================================
    if current_user.role == 'admin':
        if request.method == 'GET':
            query = GetUserRestaurantQuery(user_id=restaurante_id)
            restaurant_dto = container.execute_query(query)
            if restaurant_dto is None:
                return Response({'error': 'Restaurante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            return Response(restaurant_dto.to_dict())
        
        if request.method == 'PUT':
            # 1. Extraemos los datos manualmente
            name = request.data.get('name')
            address = request.data.get('address')
            logo_file = request.FILES.get('logo')
            logo = logo_file if logo_file else request.data.get('logo')

            try:
                command = UpdateRestaurantCommand(
                    restaurant_id=restaurante_id,
                    name=name,
                    address=address or '',
                    logo=logo,
                    actor_username=request.user.username
                )
                saved = container.execute_command(command)
                
                return Response({
                    'id': saved.id,
                    'name': saved.name,
                    'address': saved.address,
                    'logo': saved.logo,
                })
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        if request.method == 'DELETE':
            try:
                command = DeleteRestaurantCommand(
                    restaurant_id=restaurante_id,
                    actor_username=request.user.username
                )
                container.execute_command(command)
                return Response({'message': 'Restaurante eliminado'}, status=status.HTTP_204_NO_CONTENT)
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    # ============================================
    # CASO 2: ADMIN RESTAURANTE - Solo su restaurante (GET, PUT)
    # ============================================
    if current_user.role == 'restaurante':
        # Verificar que el restaurante pertenece al admin
        user_restaurant_query = GetUserRestaurantQuery(user_id=current_user.id)
        user_restaurant = container.execute_query(user_restaurant_query)
        
        if not user_restaurant:
            return Response(
                {'error': 'No tienes un restaurante asignado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar que el restaurante solicitado es el del admin
        if user_restaurant.id != restaurante_id:
            return Response(
                {'error': 'No tienes permiso para acceder a este restaurante'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.method == 'GET':
            query = GetUserRestaurantQuery(user_id=restaurante_id)
            restaurant_dto = container.execute_query(query)
            if restaurant_dto is None:
                return Response({'error': 'Restaurante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            return Response(restaurant_dto.to_dict())
        
        if request.method == 'PUT':
            name = request.data.get('name')
            address = request.data.get('address')
            logo_file = request.FILES.get('logo')
            logo = logo_file if logo_file else request.data.get('logo')

            try:
                command = UpdateRestaurantCommand(
                    restaurant_id=restaurante_id,
                    name=name,
                    address=address or '',
                    logo=logo,
                    actor_username=request.user.username
                )
                saved = container.execute_command(command)
                
                return Response({
                    'id': saved.id,
                    'name': saved.name,
                    'address': saved.address,
                    'logo': saved.logo,
                })
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # DELETE - Admin Restaurante NO puede eliminar
        if request.method == 'DELETE':
            return Response(
                {'error': 'No tienes permiso para eliminar restaurantes'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    # ============================================
    # CASO 3: OTROS ROLES - No autorizados
    # ============================================
    return Response(
        {'error': 'No autorizado'},
        status=status.HTTP_403_FORBIDDEN
    )

# ============================================
# ADMIN USUARIOS - USANDO COMMAND BUS
# ============================================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_usuarios(request):
    """
    Administración de usuarios
    - Super Admin (admin): Puede crear cualquier usuario en cualquier restaurante
    - Admin Restaurante (restaurante): Solo puede crear usuarios para su restaurante
    """
    
    current_user = request.user
    
    # ============================================
    # CASO 1: SUPER ADMIN - Puede hacer todo
    # ============================================
    if current_user.role == 'admin':
        if request.method == 'GET':
            query = ListUsersQuery()
            users = container.execute_query(query)
            serializer = UserReadSerializer(users, many=True)
            return Response(serializer.data)
        
        # POST - Crear usuario (cualquier rol, cualquier restaurante)
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            password = validated_data.pop('password', '')
            
            try:
                command = CreateUserCommand(
                    email=validated_data['email'],
                    password=password,
                    username=validated_data.get('username'),
                    role=validated_data.get('role', 'cliente'),
                    full_name=validated_data.get('full_name', ''),
                    actor_username=request.user.username
                )
                saved_user = container.execute_command(command)
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            restaurante_id = request.data.get('restaurante_id')
            if restaurante_id:
                assign_command = AssignRestaurantCommand(
                    user_id=saved_user.id,
                    restaurant_id=restaurante_id,
                    actor_username=request.user.username
                )
                container.execute_command(assign_command)
            
            return Response(UserReadSerializer(saved_user).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # ============================================
    # CASO 2: ADMIN RESTAURANTE - Solo su restaurante
    # ============================================
    if current_user.role == 'restaurante':
        # Obtener el restaurante del admin
        restaurant_query = GetUserRestaurantQuery(user_id=current_user.id)
        restaurant_dto = container.execute_query(restaurant_query)
        
        if not restaurant_dto:
            return Response(
                {'error': 'No tienes un restaurante asignado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            # CORREGIDO: Ver TODOS los usuarios de su restaurante (sin filtrar por rol)
            query = ListUsersQuery(
                restaurant_id=restaurant_dto.id  # ← SIN role
            )
            users = container.execute_query(query)
            serializer = UserReadSerializer(users, many=True)
            return Response(serializer.data)
        
        # POST - Crear usuario SOLO para su restaurante
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            password = validated_data.pop('password', '')
            
            # Validar que el rol no sea admin (Super Admin)
            role = validated_data.get('role', 'cliente')
            if role == 'admin':
                return Response(
                    {'error': 'No puedes crear usuarios con rol de Super Administrador'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Validar que el restaurante_id enviado coincide con el del admin
            requested_restaurant_id = request.data.get('restaurante_id')
            if requested_restaurant_id and int(requested_restaurant_id) != restaurant_dto.id:
                return Response(
                    {'error': 'No puedes crear usuarios para otro restaurante'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            try:
                command = CreateUserCommand(
                    email=validated_data['email'],
                    password=password,
                    username=validated_data.get('username'),
                    role=role,
                    full_name=validated_data.get('full_name', ''),
                    actor_username=request.user.username
                )
                saved_user = container.execute_command(command)
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            # Asignar al restaurante del admin
            assign_command = AssignRestaurantCommand(
                user_id=saved_user.id,
                restaurant_id=restaurant_dto.id,
                actor_username=request.user.username
            )
            container.execute_command(assign_command)
            
            return Response(UserReadSerializer(saved_user).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # ============================================
    # CASO 3: OTROS ROLES - No autorizados
    # ============================================
    return Response(
        {'error': 'No tienes permiso para administrar usuarios'},
        status=status.HTTP_403_FORBIDDEN
    )

# ============================================
# ADMIN USUARIO DETAIL - USANDO COMMAND BUS
# ============================================
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_usuario_detail(request, usuario_id):
    """
    Detalle, actualización y eliminación de usuario
    - Super Admin (admin): Puede cualquier usuario
    - Admin Restaurante (restaurante): Solo usuarios de su restaurante
    """
    
    current_user = request.user
    
    # ============================================
    # CASO 1: SUPER ADMIN - Puede hacer todo
    # ============================================
    if current_user.role == 'admin':
        if request.method == 'GET':
            query = GetUserDetailsQuery(user_id=usuario_id)
            try:
                user = container.execute_query(query)
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            serializer = UserReadSerializer(user)
            return Response(serializer.data)
        
        if request.method == 'PUT':
            query = GetUserDetailsQuery(user_id=usuario_id)
            try:
                user = container.execute_query(query)
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            
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
                except BusinessRuleValidationException as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
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
        
        if request.method == 'DELETE':
            try:
                command = DeleteUserCommand(
                    user_id=usuario_id,
                    actor_username=request.user.username
                )
                container.execute_command(command)
                return Response({'message': 'Usuario eliminado'}, status=status.HTTP_204_NO_CONTENT)
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    # ============================================
    # CASO 2: ADMIN RESTAURANTE - Solo usuarios de su restaurante
    # ============================================
    if current_user.role == 'restaurante':
        # Obtener el restaurante del admin
        admin_restaurant_query = GetUserRestaurantQuery(user_id=current_user.id)
        admin_restaurant = container.execute_query(admin_restaurant_query)
        
        if not admin_restaurant:
            return Response(
                {'error': 'No tienes un restaurante asignado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener el restaurante del usuario objetivo
        target_restaurant_query = GetUserRestaurantQuery(user_id=usuario_id)
        target_restaurant = container.execute_query(target_restaurant_query)
        
        # Si el usuario objetivo no tiene restaurante o es de otro restaurante
        if not target_restaurant or target_restaurant.id != admin_restaurant.id:
            return Response(
                {'error': 'Este usuario no pertenece a tu restaurante'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.method == 'GET':
            query = GetUserDetailsQuery(user_id=usuario_id)
            try:
                user = container.execute_query(query)
                return Response(user.to_dict())
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'PUT':
            query = GetUserDetailsQuery(user_id=usuario_id)
            try:
                user = container.execute_query(query)
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = UserUpdateSerializer(user, data=request.data)
            if serializer.is_valid():
                # Validar que el rol no sea admin (Super Admin)
                new_role = serializer.validated_data.get('role')
                if new_role == 'admin':
                    return Response(
                        {'error': 'No puedes asignar rol de Super Administrador'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                try:
                    command = UpdateUserCommand(
                        user_id=usuario_id,
                        username=serializer.validated_data.get('username'),
                        email=serializer.validated_data.get('email'),
                        role=new_role,
                        full_name=serializer.validated_data.get('full_name'),
                        actor_username=request.user.username
                    )
                    updated_user = container.execute_command(command)
                except BusinessRuleValidationException as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
                # No permitir cambiar de restaurante a un usuario de otro restaurante
                restaurante_id = request.data.get('restaurante_id')
                if restaurante_id is not None and int(restaurante_id) != admin_restaurant.id:
                    return Response(
                        {'error': 'No puedes mover usuarios a otro restaurante'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                return Response(UserReadSerializer(updated_user).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if request.method == 'DELETE':
            # Admin Restaurante puede eliminar usuarios de su restaurante
            # Verificar que no está eliminando un Super Admin
            target_user_query = GetUserDetailsQuery(user_id=usuario_id)
            try:
                target_user = container.execute_query(target_user_query)
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            
            if target_user.role == 'admin':
                return Response(
                    {'error': 'No puedes eliminar un Super Administrador'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Eliminar el usuario
            try:
                command = DeleteUserCommand(
                    user_id=usuario_id,
                    actor_username=request.user.username
                )
                container.execute_command(command)
                return Response({'message': 'Usuario eliminado'}, status=status.HTTP_204_NO_CONTENT)
            except BusinessRuleValidationException as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    # ============================================
    # CASO 3: OTROS ROLES - No autorizados
    # ============================================
    return Response(
        {'error': 'No autorizado'},
        status=status.HTTP_403_FORBIDDEN
    )


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
        except BusinessRuleValidationException as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
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
    except BusinessRuleValidationException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)