from ..domain.entities import User, UserRestaurant, Restaurant, Event


class UserRepository:
    @staticmethod
    def get_active_user_by_id(user_id):
        try:
            return User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_user_by_username(username):
        try:
            return User.objects.get(username=username, is_active=True)
        except User.DoesNotExist:
            return None

    @staticmethod
    def list_active_users(role=None):
        queryset = User.objects.filter(is_active=True)
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class RestaurantRepository:
    @staticmethod
    def get_restaurant_by_id(restaurant_id):
        try:
            return Restaurant.objects.get(id=restaurant_id)
        except Restaurant.DoesNotExist:
            return None

    @staticmethod
    def list_restaurants():
        return Restaurant.objects.all()


class EventRepository:
    @staticmethod
    def list_events(event_type=None, limit=100):
        queryset = Event.objects.all().order_by('-created_at')
        if event_type:
            queryset = queryset.filter(type=event_type)
        return queryset[:limit]

    @staticmethod
    def list_events_by_user_id(user_id, event_type=None, limit=100):
        queryset = Event.objects.all().order_by('-created_at')
        if user_id:
            queryset = queryset.filter(data__contains={'user_id': user_id})
        if event_type:
            queryset = queryset.filter(type=event_type)
        return queryset[:limit]