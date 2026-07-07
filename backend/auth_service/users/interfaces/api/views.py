from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.serializers import ValidationError 
from users.infrastructure.container import container
from users.domain.shared.core import BusinessRuleValidationException

# Importar excepciones de dominio
from users.domain.exceptions import (
    InvalidCredentialsException,
    UserNotFoundException,
    RestaurantNotFoundException,
    UserAccessDeniedException,
    RestaurantAccessDeniedException,
    InsufficientPermissionsException,
    CannotAssignAdminRoleException,
    UserAlreadyExistsException,
    UserRestaurantException,
    EventException,
)

# Importar serializers (solo para validación de entrada/salida)
from users.interfaces.serializers import (
    UserSerializer,
    UserUpdateSerializer,
    UserReadSerializer,
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
from users.application.commands.create_restaurant_wizard import CreateRestaurantWizardCommand
from users.application.queries import (
    ListUsersQuery,
    GetUserDetailsQuery,
    GetUserEventsQuery,
    GetAllEventsQuery,
    GetUserRestaurantQuery,
    ListRestaurantsQuery,
    GetRestaurantDetailsQuery,
)

from users.infrastructure.mappers.user_mapper import UserMapper


# ============================================
# REGISTER VIEW
# ============================================
class RegisterView(generics.CreateAPIView):
    """Registro público de usuarios - SOLO crea clientes"""
    
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        validated_data = serializer.validated_data
        password = validated_data.pop('password', '')
        role = 'cliente'
        
        try:
            command = CreateUserCommand(
                email=validated_data['email'],
                password=password,
                username=validated_data.get('username'),
                role=role,
                full_name=validated_data.get('full_name', ''),
                actor_username=None
            )
            saved_user = container.execute_command(command)
            
        except BusinessRuleValidationException as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except UserAlreadyExistsException as e:
            return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'id': saved_user.id,
            'username': saved_user.username,
            'email': saved_user.email,
            'role': saved_user.role,
            'full_name': saved_user.full_name,
        }, status=status.HTTP_201_CREATED)


# ============================================
# UPDATE USER VIEW
# ============================================
class UpdateUserView(generics.UpdateAPIView):
    """Actualización de usuarios - Usa CommandBus"""
    
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        django_user = self.get_object()
        
        command = UpdateUserCommand(
            user_id=django_user.id,
            username=serializer.validated_data.get('username'),
            email=serializer.validated_data.get('email'),
            role=serializer.validated_data.get('role'),
            full_name=serializer.validated_data.get('full_name'),
            actor_username=self.request.user.username
        )
        
        try:
            updated_user = container.execute_command(command)
            
            django_user.username = updated_user.username
            django_user.email = updated_user.email
            django_user.role = updated_user.role
            django_user.full_name = updated_user.full_name
            django_user.save()
            
        except BusinessRuleValidationException as e:
            raise serializers.ValidationError(str(e))
        except UserNotFoundException as e:
            raise serializers.ValidationError(str(e))
        except UserAlreadyExistsException as e:
            raise serializers.ValidationError(str(e))
        except Exception as e:
            raise serializers.ValidationError(str(e))


# ============================================
# DELETE USER VIEW
# ============================================
class DeleteUserView(generics.DestroyAPIView):
    """Eliminación (soft delete) de usuarios - Usa CommandBus"""
    
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        command = DeleteUserCommand(
            user_id=instance.id,
            actor_username=self.request.user.username
        )
        
        try:
            container.execute_command(command)
        except BusinessRuleValidationException as e:
            raise serializers.ValidationError(str(e))
        except UserNotFoundException as e:
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
# USERS LIST - USANDO QUERY BUS (SIMPLIFICADA)
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    """Lista de usuarios - Los permisos los valida el QueryHandler"""
    
    current_user = request.user
    domain_user = UserMapper.to_domain(current_user)
    role_filter = request.query_params.get('role')
    
    try:
        query = ListUsersQuery(
            current_user=domain_user,
            role=role_filter
        )
        users = container.execute_query(query)
        
        return Response({
            'count': len(users),
            'users': [u.to_dict() for u in users]
        })
    except InsufficientPermissionsException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except RestaurantNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except UserNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# USER DETAIL - USANDO QUERY BUS (SIMPLIFICADA)
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    """Detalle de un usuario - Los permisos los valida el QueryHandler"""
    
    current_user = request.user
    domain_user = UserMapper.to_domain(current_user)
    
    try:
        query = GetUserDetailsQuery(
            current_user=domain_user,
            user_id=int(user_id)
        )
        user = container.execute_query(query)
        return Response(user.to_dict())
    except UserNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except UserAccessDeniedException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except RestaurantNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except RestaurantAccessDeniedException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except InsufficientPermissionsException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
    
    try:
        if user_id:
            query = GetUserEventsQuery(user_id=int(user_id), event_type=event_type, limit=limit)
        else:
            query = GetAllEventsQuery(limit=limit)
        
        events = container.execute_query(query)
        
        return Response({
            'count': len(events),
            'events': [e.to_dict() for e in events],
        })
    except EventException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
    try:
        query = ListRestaurantsQuery()
        restaurants = container.execute_query(query)
        return Response([r.to_dict() for r in restaurants])
    except RestaurantNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# ADMIN RESTAURANTES - USANDO COMMAND/QUERY BUS
# ============================================
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_restaurantes(request):
    parser_classes = [MultiPartParser, FormParser]
    
    current_user = request.user
    domain_user = UserMapper.to_domain(current_user)
    
    try:
        # ========== GET ==========
        if request.method == 'GET':
            query = ListRestaurantsQuery(current_user=domain_user)
            restaurants = container.execute_query(query)
            return Response([r.to_dict() for r in restaurants])
        
        # ========== POST ==========
        if request.method == 'POST':
            name = request.data.get('name')
            address = request.data.get('address')
            phone = request.data.get('phone')
            lat = request.data.get('lat')
            lng = request.data.get('lng')
            delivery_fee = request.data.get('delivery_fee')
            logo = request.FILES.get('logo')

            if not name:
                return Response({'error': 'El nombre es obligatorio'}, status=400)

            command = CreateRestaurantCommand(
                name=name,
                address=address if address else '',
                phone=phone if phone else None,
                lat=float(lat) if lat else None,
                lng=float(lng) if lng else None,
                delivery_fee=float(delivery_fee) if delivery_fee else None,
                logo=logo,
                actor_username=request.user.username
            )
            saved = container.execute_command(command)

            return Response({
                'id': saved.id,
                'name': saved.name,
                'address': saved.address,
                'phone': saved.phone,
                'lat': saved.lat,
                'lng': saved.lng,
                'delivery_fee': saved.delivery_fee,
                'logo': saved.logo,
            }, status=status.HTTP_201_CREATED)
        
    except InsufficientPermissionsException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except BusinessRuleValidationException as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except RestaurantNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# ADMIN RESTAURANTE DETAIL - USANDO COMMAND/QUERY BUS (SIMPLIFICADA)
# ============================================
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_restaurante_detail(request, restaurante_id):
    """
    Detalle, actualización y eliminación de restaurante
    - Los permisos los validan los handlers
    """
    
    current_user = request.user
    domain_user = UserMapper.to_domain(current_user)
    
    try:
        # ========== GET ==========
        if request.method == 'GET':
            query = GetRestaurantDetailsQuery(
                current_user=domain_user,
                restaurant_id=int(restaurante_id)
            )
            restaurant = container.execute_query(query)
            return Response(restaurant.to_dict())
        
        # ========== PUT ==========
        if request.method == 'PUT':
            
            # Validar permisos
            query = GetRestaurantDetailsQuery(
                current_user=domain_user,
                restaurant_id=int(restaurante_id)
            )
            container.execute_query(query)
            
            name = request.data.get('name')
            address = request.data.get('address')
            phone = request.data.get('phone')
            lat = request.data.get('lat')
            lng = request.data.get('lng')
            delivery_fee = request.data.get('delivery_fee')
            logo_file = request.FILES.get('logo')
            logo = logo_file if logo_file else request.data.get('logo')

            command = UpdateRestaurantCommand(
                restaurant_id=int(restaurante_id),
                name=name,
                address=address or '',
                phone=phone if phone else None,
                lat=float(lat) if lat else None,
                lng=float(lng) if lng else None,
                delivery_fee=float(delivery_fee) if delivery_fee else None,
                logo=logo,
                actor_username=request.user.username
            )
            saved = container.execute_command(command)

            return Response({
                'id': saved.id,
                'name': saved.name,
                'address': saved.address,
                'phone': saved.phone,
                'lat': saved.lat,
                'lng': saved.lng,
                'delivery_fee': saved.delivery_fee,
                'logo': saved.logo,
            })
        
        # ========== DELETE ==========
        if request.method == 'DELETE':
            # Validar permisos
            query = GetRestaurantDetailsQuery(
                current_user=domain_user,
                restaurant_id=int(restaurante_id)
            )
            container.execute_query(query)
            
            command = DeleteRestaurantCommand(
                restaurant_id=int(restaurante_id),
                actor_username=request.user.username
            )
            container.execute_command(command)
            return Response({'message': 'Restaurante eliminado'}, status=204)
        
    except RestaurantNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except RestaurantAccessDeniedException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except InsufficientPermissionsException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except BusinessRuleValidationException as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ============================================
# ADMIN USUARIOS - USANDO COMMAND/QUERY BUS
# ============================================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_usuarios(request):
    """
    Administración de usuarios
    - Los permisos los validan los handlers
    """
    
    current_user = request.user
    domain_user = UserMapper.to_domain(current_user)
    
    try:
        # ========== GET ==========
        if request.method == 'GET':
            query = ListUsersQuery(current_user=domain_user)
            users = container.execute_query(query)
            serializer = UserReadSerializer(users, many=True)
            return Response(serializer.data)
        
        # ========== POST ==========
        if request.method == 'POST':
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                validated_data = serializer.validated_data
                password = validated_data.pop('password', '')
                
                restaurante_id = request.data.get('restaurante_id')
                
                command = CreateUserCommand(
                    email=validated_data['email'],
                    password=password,
                    username=validated_data.get('username'),
                    role=validated_data.get('role', 'cliente'),
                    full_name=validated_data.get('full_name', ''),
                    actor_username=request.user.username,
                    assign_restaurant_id=int(restaurante_id) if restaurante_id else None
                )
                saved_user = container.execute_command(command)
                
                return Response(UserReadSerializer(saved_user).data, status=201)
            
            return Response(serializer.errors, status=400)
        
    except InsufficientPermissionsException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except RestaurantNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except RestaurantAccessDeniedException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except CannotAssignAdminRoleException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except BusinessRuleValidationException as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except UserAlreadyExistsException as e:
        return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# ADMIN USUARIO DETAIL - USANDO COMMAND/QUERY BUS
# ============================================
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_usuario_detail(request, usuario_id):
    """
    Detalle, actualización y eliminación de usuario
    - Los permisos los validan los handlers
    """
    
    current_user = request.user
    domain_user = UserMapper.to_domain(current_user)
    
    try:
        # ========== GET ==========
        if request.method == 'GET':
            query = GetUserDetailsQuery(
                current_user=domain_user,
                user_id=int(usuario_id)
            )
            user = container.execute_query(query)
            serializer = UserReadSerializer(user)
            return Response(serializer.data)
        
        # ========== PUT ==========
        if request.method == 'PUT':
            query = GetUserDetailsQuery(
                current_user=domain_user,
                user_id=int(usuario_id)
            )
            user = container.execute_query(query)
            
            serializer = UserUpdateSerializer(user, data=request.data)
            if serializer.is_valid():
                restaurante_id = request.data.get('restaurante_id')
                unassign = request.data.get('unassign_restaurant', False)
                
                command = UpdateUserCommand(
                    user_id=int(usuario_id),
                    username=serializer.validated_data.get('username'),
                    email=serializer.validated_data.get('email'),
                    role=serializer.validated_data.get('role'),
                    full_name=serializer.validated_data.get('full_name'),
                    actor_username=request.user.username,
                    assign_restaurant_id=int(restaurante_id) if restaurante_id else None,
                    unassign_restaurant=bool(unassign)
                )
                updated_user = container.execute_command(command)
                
                return Response(UserReadSerializer(updated_user).data)
            return Response(serializer.errors, status=400)
        
        # ========== DELETE ==========
        if request.method == 'DELETE':
            query = GetUserDetailsQuery(
                current_user=domain_user,
                user_id=int(usuario_id)
            )
            container.execute_query(query)  # Solo para validar permisos
            
            command = DeleteUserCommand(
                user_id=int(usuario_id),
                actor_username=request.user.username
            )
            container.execute_command(command)
            return Response({'message': 'Usuario eliminado'}, status=204)
        
    except UserNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except RestaurantNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except UserAccessDeniedException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except RestaurantAccessDeniedException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except InsufficientPermissionsException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except CannotAssignAdminRoleException as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except BusinessRuleValidationException as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except UserAlreadyExistsException as e:
        return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# ADMIN ASIGNAR RESTAURANTE
# ============================================
@api_view(['POST', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_asignar_restaurante(request, usuario_id):
    """Asignar o desasignar restaurante a un usuario - Usa CommandBus"""
    
    try:
        if request.method == 'POST':
            restaurante_id = request.data.get('restaurante_id')
            if not restaurante_id:
                return Response(
                    {'error': 'Se requiere restaurante_id'},
                    status=400
                )
            
            command = AssignRestaurantCommand(
                user_id=usuario_id,
                restaurant_id=restaurante_id,
                actor_username=request.user.username
            )
            container.execute_command(command)
            return Response({'message': 'Usuario asignado correctamente'})
        
        # DELETE - Desasignar
        command = UnassignRestaurantCommand(
            user_id=usuario_id,
            actor_username=request.user.username
        )
        container.execute_command(command)
        return Response({'message': 'Usuario desasignado de su restaurante'})
        
    except UserNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except RestaurantNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except UserRestaurantException as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# WIZARD DE REGISTRO - USUARIO + RESTAURANTE EN UN SOLO PASO
# ============================================
@api_view(['POST'])
@permission_classes([IsAdminUser])
def wizard_restaurante(request):
    """
    Recibe los datos de los 2 pasos del wizard y ejecuta CreateRestaurantWizardCommand,
    que a su vez orquesta (sin duplicar logica): CreateUserCommand -> CreateRestaurantCommand
    -> AssignRestaurantCommand.
    """
    try:
        lat = request.data.get('restaurant_lat')
        lng = request.data.get('restaurant_lng')
        delivery_fee = request.data.get('restaurant_delivery_fee')
        command = CreateRestaurantWizardCommand(
            user_email=request.data.get('user_email'),
            user_password=request.data.get('user_password'),
            user_full_name=request.data.get('user_full_name', ''),
            user_username=request.data.get('user_username') or None,
            restaurant_name=request.data.get('restaurant_name'),
            restaurant_address=request.data.get('restaurant_address', ''),
            restaurant_phone=request.data.get('restaurant_phone') or None,
            restaurant_lat=float(lat) if lat else None,
            restaurant_lng=float(lng) if lng else None,
            restaurant_delivery_fee=float(delivery_fee) if delivery_fee else None,
            restaurant_logo=request.FILES.get('restaurant_logo'),
            actor_username=request.user.username,
        )
        saved_user, saved_restaurant = container.execute_command(command)

        return Response({
            'user': {
                'id': saved_user.id,
                'username': saved_user.username,
                'email': saved_user.email,
                'full_name': saved_user.full_name,
                'role': saved_user.role,
            },
            'restaurant': {
                'id': saved_restaurant.id,
                'name': saved_restaurant.name,
                'address': saved_restaurant.address,
                'phone': saved_restaurant.phone,
                'lat': saved_restaurant.lat,
                'lng': saved_restaurant.lng,
                'delivery_fee': saved_restaurant.delivery_fee,
                'logo': saved_restaurant.logo,
            },
        }, status=status.HTTP_201_CREATED)

    except UserAlreadyExistsException as e:
        return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
    except BusinessRuleValidationException as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except RestaurantNotFoundException as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except UserRestaurantException as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)