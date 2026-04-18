from django.contrib import admin
from django.urls import path
from users.views import (
    RegisterView,
    UpdateUserView,
    DeleteUserView,
    profile,
    users_list,
    user_detail,
    event_history
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # ============================================
    # JWT Authentication
    # ============================================
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ============================================
    # COMMANDS - Escritura (CQRS)
    # ============================================
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/users/<int:pk>/update/', UpdateUserView.as_view(), name='update_user'),
    path('api/users/<int:pk>/delete/', DeleteUserView.as_view(), name='delete_user'),

    # ============================================
    # QUERIES - Lectura (CQRS)
    # ============================================
    path('api/profile/', profile, name='profile'),
    path('api/users/', users_list, name='users_list'),
    path('api/users/<int:user_id>/', user_detail, name='user_detail'),
    path('api/events/', event_history, name='event_history'),
]