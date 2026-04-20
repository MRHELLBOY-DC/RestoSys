from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Category, Product, ProductOption
from .serializers import CategorySerializer, ProductSerializer, ProductOptionSerializer


# ========== PERMISO PERSONALIZADO PARA VERIFICAR ROL ==========
class IsRestaurantOrAdmin(IsAuthenticated):
    """Permite acceso solo a usuarios con rol restaurante o admin"""
    
    def has_permission(self, request, view):
        # Primero verificar que está autenticado
        if not super().has_permission(request, view):
            return False
        
        # Verificar el rol
        role = getattr(request.user, 'role', None)
        return role in ['restaurante', 'admin']


# ========== CATEGORÍAS CRUD ==========
class CategoryListCreate(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsRestaurantOrAdmin]

    def get_queryset(self):
        restaurant_id = getattr(self.request.user, 'restaurant_id', None)
        if restaurant_id:
            return Category.objects.filter(restaurant_id=restaurant_id)
        return Category.objects.none()

    def perform_create(self, serializer):
        restaurant_id = getattr(self.request.user, 'restaurant_id', None)
        serializer.save(restaurant_id=restaurant_id)


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsRestaurantOrAdmin]

    def get_queryset(self):
        restaurant_id = getattr(self.request.user, 'restaurant_id', None)
        if restaurant_id:
            return Category.objects.filter(restaurant_id=restaurant_id)
        return Category.objects.none()


# ========== PRODUCTOS CRUD ==========
class ProductListCreate(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsRestaurantOrAdmin]

    def get_queryset(self):
        restaurant_id = getattr(self.request.user, 'restaurant_id', None)
        if restaurant_id:
            return Product.objects.filter(restaurant_id=restaurant_id)
        return Product.objects.none()

    def perform_create(self, serializer):
        restaurant_id = getattr(self.request.user, 'restaurant_id', None)
        serializer.save(restaurant_id=restaurant_id)


class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsRestaurantOrAdmin]

    def get_queryset(self):
        restaurant_id = getattr(self.request.user, 'restaurant_id', None)
        if restaurant_id:
            return Product.objects.filter(restaurant_id=restaurant_id)
        return Product.objects.none()


# ========== OPCIONES CRUD ==========
class ProductOptionListCreate(generics.ListCreateAPIView):
    serializer_class = ProductOptionSerializer
    permission_classes = [IsRestaurantOrAdmin]

    def get_queryset(self):
        restaurant_id = getattr(self.request.user, 'restaurant_id', None)
        if restaurant_id:
            return ProductOption.objects.filter(product__restaurant_id=restaurant_id)
        return ProductOption.objects.none()


class ProductOptionDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductOptionSerializer
    permission_classes = [IsRestaurantOrAdmin]

    def get_queryset(self):
        restaurant_id = getattr(self.request.user, 'restaurant_id', None)
        if restaurant_id:
            return ProductOption.objects.filter(product__restaurant_id=restaurant_id)
        return ProductOption.objects.none()


# ========== ENDPOINTS PÚBLICOS (sin autenticación) ==========
class PublicProductList(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = []

    def get_queryset(self):
        restaurant_id = self.request.query_params.get('restaurant_id')
        if restaurant_id:
            return Product.objects.filter(restaurant_id=restaurant_id)
        return Product.objects.all()


class PublicCategoryList(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = []

    def get_queryset(self):
        restaurant_id = self.request.query_params.get('restaurant_id')
        if restaurant_id:
            return Category.objects.filter(restaurant_id=restaurant_id)
        return Category.objects.all()