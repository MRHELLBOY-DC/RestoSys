from django.contrib import admin
from django.conf import settings
from django.urls import path
from users.interfaces.api.views import (
    RegisterView,
    UpdateUserView,
    DeleteUserView,
    profile,
    users_list,
    user_detail,
    event_history,
    login,  # Importar login personalizado
    admin_restaurantes,
    admin_restaurante_detail,
    admin_usuarios,
    admin_usuario_detail,
    admin_asignar_restaurante,
    public_restaurantes,
    wizard_restaurante,
)
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # ============================================
    # JWT Authentication
    # ============================================
    path('api/login/', login, name='login'),  # Login personalizado
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

    # ============================================
    # PUBLIC ENDPOINTS (para la landing page)
    # ============================================
    path('api/public/restaurantes/', public_restaurantes, name='public_restaurantes'),

    # ============================================
    # ADMIN - CRUD RESTAURANTES
    # ============================================
    path('api/admin/restaurantes/', admin_restaurantes, name='admin_restaurantes'),
    path('api/admin/restaurantes/<int:restaurante_id>/', admin_restaurante_detail, name='admin_restaurante_detail'),
    
    # ============================================
    # ADMIN - CRUD USUARIOS
    # ============================================
    path('api/admin/usuarios/', admin_usuarios, name='admin_usuarios'),
    path('api/admin/usuarios/<int:usuario_id>/', admin_usuario_detail, name='admin_usuario_detail'),
    
    # ============================================
    # ADMIN - ASIGNAR RESTAURANTE A USUARIO
    # ============================================
    path('api/admin/usuarios/<int:usuario_id>/asignar-restaurante/', admin_asignar_restaurante, name='admin_asignar_restaurante'),

    # ============================================
    # WIZARD - REGISTRO GUIADO DE RESTAURANTE (usuario + restaurante)
    # ============================================
    path('api/wizard/restaurante/', wizard_restaurante, name='wizard_restaurante'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)