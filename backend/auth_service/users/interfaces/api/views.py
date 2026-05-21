from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

# IMPORTACIONES CORREGIDAS
from users.domain.entities import User, UserRestaurant, Restaurant
from users.interfaces.serializers import (
    UserSerializer,
    UserUpdateSerializer,
    UserReadSerializer,
    RestaurantSerializer,
)
from users.interfaces.api.permissions import IsRestaurantOrAdmin
from users.application.commands import (
    create_user_event,
    update_user_event,
    delete_user_event,
)
from users.application.queries import (
    list_users,
    get_user_details,
    get_user_events,
    get_all_events,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        create_user_event(user)


class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        user = self.get_object()
        old_data = {
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
        updated_user = serializer.save()
        new_data = {
            'username': updated_user.username,
            'email': updated_user.email,
            'role': updated_user.role,
        }
        update_user_event(updated_user, old_data, new_data)


class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        delete_user_event(instance)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    restaurant_data = None
    user_restaurant = UserRestaurant.objects.filter(user=user).first()
    if user_restaurant:
        restaurant_data = RestaurantSerializer(user_restaurant.restaurant).data
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'full_name': user.full_name,
        'restaurant': restaurant_data,
        'date_joined': user.date_joined,
        'last_login': user.last_login,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    role = request.query_params.get('role')
    users = list_users(role=role)
    return Response({
        'count': len(users),
        'users': users,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    user = get_user_details(user_id)
    if user is None:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    return Response(user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_history(request):
    user_id = request.query_params.get('user_id')
    event_type = request.query_params.get('type')
    limit = int(request.query_params.get('limit', 100))
    if user_id:
        events = get_user_events(user_id=user_id, event_type=event_type, limit=limit)
    else:
        events = get_all_events(limit=limit)
    return Response({
        'count': len(events),
        'events': events,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')
    user_lookup = None
    if email:
        user_lookup = User.objects.filter(email__iexact=email.strip()).first()
    elif username:
        user_lookup = User.objects.filter(username__iexact=username.strip()).first()

    user = None
    if user_lookup:
        user = authenticate(username=user_lookup.username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        restaurant_id = None
        restaurant_data = None
        user_restaurant = UserRestaurant.objects.filter(user=user).first()
        if user_restaurant:
            restaurant_id = user_restaurant.restaurant.id
            restaurant_data = RestaurantSerializer(user_restaurant.restaurant).data
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
                'full_name': user.full_name,
                'role': user.role,
                'restaurant': restaurant_data,
                'restaurant_id': restaurant_id,
            },
        })
    return Response({'success': False, 'message': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_restaurantes(request):
    if request.method == 'GET':
        restaurantes = Restaurant.objects.all()
        serializer = RestaurantSerializer(restaurantes, many=True)
        return Response(serializer.data)
    serializer = RestaurantSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_restaurante_detail(request, restaurante_id):
    try:
        restaurante = Restaurant.objects.get(id=restaurante_id)
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = RestaurantSerializer(restaurante)
        return Response(serializer.data)
    if request.method == 'PUT':
        serializer = RestaurantSerializer(restaurante, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    restaurante.delete()
    return Response({'message': 'Restaurante eliminado'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_usuarios(request):
    if request.method == 'GET':
        usuarios = User.objects.all()
        serializer = UserReadSerializer(usuarios, many=True)
        return Response(serializer.data)
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
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
    try:
        usuario = User.objects.get(id=usuario_id)
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = UserReadSerializer(usuario)
        return Response(serializer.data)
    if request.method == 'PUT':
        serializer = UserUpdateSerializer(usuario, data=request.data)
        if serializer.is_valid():
            serializer.save()
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
    usuario.delete()
    return Response({'message': 'Usuario eliminado'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_asignar_restaurante(request, usuario_id):
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
            UserRestaurant.objects.update_or_create(user=usuario, defaults={'restaurant': restaurante})
            return Response({'message': f'Usuario {usuario.username} asignado a {restaurante.name}'})
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    UserRestaurant.objects.filter(user=usuario).delete()
    return Response({'message': f'Usuario {usuario.username} desasignado de su restaurante'})
