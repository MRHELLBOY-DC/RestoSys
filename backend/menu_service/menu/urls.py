from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .interfaces.api.views import (
    CategoryListCreateView,
    CategoryDetailView,
    ProductListCreateView,
    ProductDetailView,
    OptionListCreateView,
    OptionDetailView,
    PublicProductListView,
    PublicCategoryListView,
)

urlpatterns = [
    # ========== ENDPOINTS PRIVADOS (requieren autenticación) ==========
    # CATEGORÍAS
    path('api/categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('api/categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    
    # PRODUCTOS
    path('api/products/', ProductListCreateView.as_view(), name='product-list'),
    path('api/products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    
    # OPCIONES
    path('api/options/', OptionListCreateView.as_view(), name='option-list'),
    path('api/options/<int:pk>/', OptionDetailView.as_view(), name='option-detail'),
    
    # ========== ENDPOINTS PÚBLICOS (sin autenticación) ==========
    path('api/public/products/', PublicProductListView.as_view(), name='public-products'),
    path('api/public/categories/', PublicCategoryListView.as_view(), name='public-categories'),
]

# Servir archivos multimedia en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)