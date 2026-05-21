from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from ..domain.entities import User, Restaurant, UserRestaurant


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'address']


class UserSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(write_only=True, required=False)
    restaurant_address = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'role', 'full_name', 'restaurant_name', 'restaurant_address']
        extra_kwargs = {
            'username': {'required': False},
            'password': {'write_only': True},
            'email': {'required': True},
            'full_name': {'required': False}
        }

    # ========== VALIDACIÓN DE USUARIO ==========
    def validate_username(self, value):
        """Validar nombre de usuario"""
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre de usuario es requerido")
        
        if len(value) < 3:
            raise serializers.ValidationError("El nombre de usuario debe tener al menos 3 caracteres")
        
        if len(value) > 30:
            raise serializers.ValidationError("El nombre de usuario no puede tener más de 30 caracteres")
        
        if ' ' in value:
            raise serializers.ValidationError("El nombre de usuario no puede contener espacios")
        
        # Verificar si ya existe (case insensitive)
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está registrado")
        
        return value.strip()

    # ========== VALIDACIÓN DE EMAIL ==========
    def validate_email(self, value):
        """Validar email"""
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
        
        # Verificar si ya existe (case insensitive)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado")
        
        return value.strip().lower()

    # ========== VALIDACIÓN DE CONTRASEÑA ==========
    def validate_password(self, value):
        """Validar contraseña"""
        if not value:
            raise serializers.ValidationError("La contraseña es requerida")
        
        if len(value) < 6:
            raise serializers.ValidationError("La contraseña debe tener al menos 6 caracteres")
        
        if len(value) > 128:
            raise serializers.ValidationError("La contraseña no puede tener más de 128 caracteres")
        
        return value

    # ========== VALIDACIÓN DE ROL ==========
    def validate_role(self, value):
        """Validar rol"""
        valid_roles = ['cliente', 'restaurante', 'admin']
        if value not in valid_roles:
            raise serializers.ValidationError(f"Rol inválido. Opciones: {', '.join(valid_roles)}")
        return value

    def validate_full_name(self, value):
        if value and len(value.strip()) > 100:
            raise serializers.ValidationError("El nombre completo no puede tener más de 100 caracteres")
        return value.strip() if value else ''

    # ========== VALIDACIÓN GENERAL ==========
    def validate(self, data):
        """Validaciones que dependen de múltiples campos"""
        role = data.get('role')
        restaurant_name = data.get('restaurant_name')
        
        # Si es restaurante, requiere nombre del restaurante
        if role == 'restaurante':
            if not restaurant_name:
                raise serializers.ValidationError({
                    "restaurant_name": "El nombre del restaurante es requerido para usuarios con rol restaurante"
                })
            
            if len(restaurant_name) < 3:
                raise serializers.ValidationError({
                    "restaurant_name": "El nombre del restaurante debe tener al menos 3 caracteres"
                })
            
            if len(restaurant_name) > 100:
                raise serializers.ValidationError({
                    "restaurant_name": "El nombre del restaurante no puede tener más de 100 caracteres"
                })
        
        return data

    def create(self, validated_data):
        restaurant_name = validated_data.pop('restaurant_name', None)
        restaurant_address = validated_data.pop('restaurant_address', None)
        
        email = validated_data.pop('email', None)
        
        # Validación extra por seguridad
        if not email:
            raise serializers.ValidationError({"email": "El email es requerido"})

        username = validated_data.get('username') or email

        user = User.objects.create_user(
            username=username,
            password=validated_data['password'],
            email=email,
            role=validated_data.get('role', 'cliente'),
            full_name=validated_data.get('full_name', '')
        )

        if user.role == 'restaurante' and restaurant_name:
            restaurant = Restaurant.objects.create(
                name=restaurant_name,
                address=restaurant_address or ''
            )
            UserRestaurant.objects.create(user=user, restaurant=restaurant)

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'role', 'full_name']

    def validate_username(self, value):
        """Validar nombre de usuario en actualización"""
        if value and ' ' in value:
            raise serializers.ValidationError("El nombre de usuario no puede contener espacios")
        if value and len(value) < 3:
            raise serializers.ValidationError("El nombre de usuario debe tener al menos 3 caracteres")
        return value

    def validate_email(self, value):
        """Validar email en actualización"""
        if value and '@' not in value:
            raise serializers.ValidationError("Ingresa un email válido")
        return value

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.role = validated_data.get('role', instance.role)
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.save()
        return instance


class UserReadSerializer(serializers.ModelSerializer):
    restaurant = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'full_name', 'date_joined', 'last_login', 'is_active', 'restaurant']

    def get_restaurant(self, obj):
        try:
            user_restaurant = UserRestaurant.objects.filter(user=obj).first()
            if user_restaurant:
                return RestaurantSerializer(user_restaurant.restaurant).data
        except Exception:
            pass
        return None
