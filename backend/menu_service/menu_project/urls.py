from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from menu.views import (
    CategoryListCreate, CategoryDetail,
    ProductListCreate, ProductDetail,
    ProductOptionListCreate, ProductOptionDetail,
    PublicProductList, PublicCategoryList
)

urlpatterns = [
    # ========== ENDPOINTS PRIVADOS (requieren autenticación) ==========
    # CATEGORÍAS
    path('api/categories/', CategoryListCreate.as_view(), name='category-list'),
    path('api/categories/<int:pk>/', CategoryDetail.as_view(), name='category-detail'),
    
    # PRODUCTOS
    path('api/products/', ProductListCreate.as_view(), name='product-list'),
    path('api/products/<int:pk>/', ProductDetail.as_view(), name='product-detail'),
    
    # OPCIONES
    path('api/options/', ProductOptionListCreate.as_view(), name='option-list'),
    path('api/options/<int:pk>/', ProductOptionDetail.as_view(), name='option-detail'),
    
    # ========== ENDPOINTS PÚBLICOS (sin autenticación) ==========
    path('api/public/products/', PublicProductList.as_view(), name='public-products'),
    path('api/public/categories/', PublicCategoryList.as_view(), name='public-categories'),
]

# Servir archivos multimedia en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)