from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Incluir todas las URLs de la app menu
    path('', include('menu.urls')),
]

# Servir archivos multimedia en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)