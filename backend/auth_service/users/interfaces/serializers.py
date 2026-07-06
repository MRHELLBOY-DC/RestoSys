"""
Serializers - Capa de Interfaces
SOLO validan formato de datos de entrada/salida.
NO contienen lógica de negocio.
"""
from rest_framework import serializers
from users.domain.entities.user import User as DomainUser
from users.domain.entities.restaurant import Restaurant as DomainRestaurant


class RestaurantSerializer(serializers.Serializer):
    """Serializer para Restaurant - solo valida formato"""
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    address = serializers.CharField(max_length=200, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True, allow_null=True)
    lat = serializers.FloatField(required=False, allow_null=True)
    lng = serializers.FloatField(required=False, allow_null=True)
    logo = serializers.CharField(max_length=500, required=False, allow_blank=True, allow_null=True)

    def create(self, validated_data):
        """Crea un restaurante - solo valida, no guarda"""
        return DomainRestaurant(
            id=None,
            name=validated_data['name'],
            address=validated_data.get('address', ''),
            phone=validated_data.get('phone'),
            lat=validated_data.get('lat'),
            lng=validated_data.get('lng'),
            logo=validated_data.get('logo'),
        )

    def update(self, instance, validated_data):
        """Actualiza un restaurante - solo valida, no guarda"""
        instance.name = validated_data.get('name', instance.name)
        instance.address = validated_data.get('address', instance.address)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.lat = validated_data.get('lat', instance.lat)
        instance.lng = validated_data.get('lng', instance.lng)
        instance.logo = validated_data.get('logo', instance.logo)
        return instance


class UserSerializer(serializers.Serializer):
    """Serializer para creación de usuarios - solo valida formato"""
    
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6, max_length=128)
    email = serializers.EmailField(required=True)
    role = serializers.ChoiceField(choices=['cliente', 'admin', 'restaurante', 'empleado'], default='cliente')
    full_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # Campos para creación de restaurante
    restaurant_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    restaurant_address = serializers.CharField(write_only=True, required=False, allow_blank=True)
    restaurant_logo = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    restaurante_id = serializers.IntegerField(write_only=True, required=False)

    # ========== VALIDACIONES DE FORMATO SOLO ==========
    
    def validate_username(self, value):
        """Validar formato de nombre de usuario (no verifica existencia)"""
        if value and not value.strip():
            raise serializers.ValidationError("El nombre de usuario es requerido")
        if value and len(value) > 150:
            raise serializers.ValidationError("El nombre de usuario no puede tener más de 150 caracteres")
        if value and ' ' in value:
            raise serializers.ValidationError("El nombre de usuario no puede contener espacios")
        return value.strip() if value else None

    def validate_email(self, value):
        """Validar formato de email (no verifica existencia)"""
        if not value or not value.strip():
            raise serializers.ValidationError("El correo electrónico es requerido")
        if len(value) > 100:
            raise serializers.ValidationError("El correo electrónico no puede tener más de 100 caracteres")
        if '@' not in value:
            raise serializers.ValidationError("Ingresa un correo electrónico válido (debe contener @)")
        if '.' not in value:
            raise serializers.ValidationError("Ingresa un correo electrónico válido (debe contener .)")
        parts = value.split('@')
        if len(parts) != 2 or not parts[0] or not parts[1]:
            raise serializers.ValidationError("Ingresa un correo electrónico válido")
        return value.strip().lower()

    def validate_password(self, value):
        """Validar formato de contraseña"""
        if not value:
            raise serializers.ValidationError("La contraseña es requerida")
        if len(value) < 6:
            raise serializers.ValidationError("La contraseña debe tener al menos 6 caracteres")
        if len(value) > 128:
            raise serializers.ValidationError("La contraseña no puede tener más de 128 caracteres")
        return value

    def validate_role(self, value):
        """Validar rol"""
        valid_roles = ['cliente', 'restaurante', 'admin', 'empleado']
        if value not in valid_roles:
            raise serializers.ValidationError(f"Rol inválido. Opciones: {', '.join(valid_roles)}")
        return value

    def validate_full_name(self, value):
        """Validar formato de nombre completo"""
        if value and len(value.strip()) > 100:
            raise serializers.ValidationError("El nombre completo no puede tener más de 100 caracteres")
        return value.strip() if value else ''

    def validate(self, data):
        """Validaciones que dependen de múltiples campos (solo formato)"""
        role = data.get('role')
        restaurant_name = data.get('restaurant_name')
        restaurante_id = data.get('restaurante_id')
        
        if role == 'restaurante':
            if not restaurant_name and not restaurante_id:
                raise serializers.ValidationError({
                    "restaurante_id": "Se requiere el nombre del restaurante o un ID de restaurante existente"
                })
            if restaurant_name and len(restaurant_name) > 100:
                raise serializers.ValidationError({
                    "restaurant_name": "El nombre del restaurante no puede tener más de 100 caracteres"
                })
        return data

    def create(self, validated_data):
        """
        Crea una entidad de dominio User a partir de datos validados.
        NO genera username, NO guarda en BD.
        """
        from datetime import datetime
        
        password = validated_data.pop('password', '')
        
        domain_user = DomainUser(
            id=None,
            username=validated_data.get('username'),
            email=validated_data['email'],
            role=validated_data.get('role', 'cliente'),
            password=password,
            full_name=validated_data.get('full_name', ''),
            is_active=True,
            date_joined=datetime.now(),
            last_login=None,
        )
        
        return domain_user


class UserUpdateSerializer(serializers.Serializer):
    """Serializer para actualización de usuarios - solo valida formato"""
    
    username = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    role = serializers.ChoiceField(choices=['cliente', 'admin', 'restaurante', 'empleado'], required=False)
    full_name = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate_username(self, value):
        if value and ' ' in value:
            raise serializers.ValidationError("El nombre de usuario no puede contener espacios")
        if value and len(value) > 150:
            raise serializers.ValidationError("El nombre de usuario no puede tener más de 150 caracteres")
        return value

    def validate_email(self, value):
        if value and '@' not in value:
            raise serializers.ValidationError("Ingresa un email válido")
        return value

    def update(self, instance, validated_data):
        if 'username' in validated_data and validated_data['username']:
            instance.username = validated_data['username']
        if 'email' in validated_data and validated_data['email']:
            instance.email = validated_data['email']
        if 'role' in validated_data and validated_data['role']:
            instance.role = validated_data['role']
        if 'full_name' in validated_data and validated_data['full_name'] is not None:
            instance.full_name = validated_data['full_name']
        return instance


class UserReadSerializer(serializers.Serializer):
    """Serializer para lectura de usuarios - trabaja con DTOs o entidades"""
    
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    full_name = serializers.CharField(required=False, allow_blank=True, default='')
    date_joined = serializers.DateTimeField(required=False)
    last_login = serializers.DateTimeField(allow_null=True, required=False)
    is_active = serializers.BooleanField(required=False, default=True)
    restaurant = serializers.SerializerMethodField()

    def get_restaurant(self, obj):
        if isinstance(obj, dict):
            return obj.get('restaurant')
        if hasattr(obj, '_restaurant_data'):
            return obj._restaurant_data
        if hasattr(obj, 'to_dict'):
            return obj.to_dict().get('restaurant')
        return None
    
    def to_representation(self, instance):
        # Si es DTO
        if hasattr(instance, 'to_dict'):
            return instance.to_dict()
        # Si es lista de DTOs
        if isinstance(instance, list):
            return [self.to_representation(item) for item in instance]
        # Si es entidad de dominio
        return {
            'id': instance.id,
            'username': instance.username,
            'email': instance.email,
            'role': instance.role,
            'full_name': getattr(instance, 'full_name', ''),
            'date_joined': getattr(instance, 'date_joined', None),
            'last_login': getattr(instance, 'last_login', None),
            'is_active': getattr(instance, 'is_active', True),
            'restaurant': self.get_restaurant(instance),
        }