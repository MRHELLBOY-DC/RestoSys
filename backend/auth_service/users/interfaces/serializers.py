from rest_framework import serializers
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
        fields = ['id', 'username', 'password', 'role', 'restaurant_name', 'restaurant_address']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        restaurant_name = validated_data.pop('restaurant_name', None)
        restaurant_address = validated_data.pop('restaurant_address', None)

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'cliente')
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
        fields = ['username', 'email', 'role']

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.role = validated_data.get('role', instance.role)
        instance.save()
        return instance


class UserReadSerializer(serializers.ModelSerializer):
    restaurant = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'date_joined', 'last_login', 'is_active', 'restaurant']

    def get_restaurant(self, obj):
        try:
            user_restaurant = UserRestaurant.objects.filter(user=obj).first()
            if user_restaurant:
                return RestaurantSerializer(user_restaurant.restaurant).data
        except Exception:
            pass
        return None
