"""
API Views - Endpoints que usan commands y queries
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .permissions import IsRestaurantOrAdmin
from .serializers import CategorySerializer, ProductSerializer, ProductOptionSerializer
from ...application.commands import (
    create_category_command,
    update_category_command,
    delete_category_command,
    create_product_command,
    update_product_command,
    delete_product_command,
    create_option_command,
    update_option_command,
    delete_option_command,
)
from ...application.queries import (
    list_categories_query,
    get_category_query,
    list_products_query,
    get_product_query,
    list_options_by_product_query,
    get_option_query,
)


# ========== CATEGORÍAS ==========

class CategoryListCreateView(APIView):
    """Listar y crear categorías"""
    permission_classes = [IsRestaurantOrAdmin]
    
    def get(self, request):
        """Listar categorías del restaurante"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        categories = list_categories_query(restaurant_id)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Crear una nueva categoría"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        name = request.data.get('name')
        if not name:
            return Response(
                {'error': 'El nombre es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            category = create_category_command(name, restaurant_id)
            serializer = CategorySerializer(category)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    """Obtener, actualizar y eliminar una categoría"""
    permission_classes = [IsRestaurantOrAdmin]
    
    def get(self, request, pk):
        """Obtener una categoría"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        category = get_category_query(pk, restaurant_id)
        if not category:
            return Response(
                {'error': 'Categoría no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CategorySerializer(category)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Actualizar una categoría"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        name = request.data.get('name')
        if not name:
            return Response(
                {'error': 'El nombre es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            category = update_category_command(pk, name, restaurant_id)
            serializer = CategorySerializer(category)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Eliminar una categoría"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            delete_category_command(pk, restaurant_id)
            return Response(
                {'message': 'Categoría eliminada correctamente'},
                status=status.HTTP_204_NO_CONTENT
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ========== PRODUCTOS ==========

class ProductListCreateView(APIView):
    """Listar y crear productos"""
    permission_classes = [IsRestaurantOrAdmin]
    
    def get(self, request):
        """Listar productos del restaurante"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        category_id = request.query_params.get('category_id')
        products = list_products_query(restaurant_id, category_id)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Crear un nuevo producto"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = create_product_command(
                name=request.data.get('name'),
                price=request.data.get('price'),
                category_id=request.data.get('category_id'),
                restaurant_id=restaurant_id,
                image=request.FILES.get('image') or request.data.get('image'),
                description=request.data.get('description')
            )
            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailView(APIView):
    """Obtener, actualizar y eliminar un producto"""
    permission_classes = [IsRestaurantOrAdmin]
    
    def get(self, request, pk):
        """Obtener un producto"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product = get_product_query(pk, restaurant_id)
        if not product:
            return Response(
                {'error': 'Producto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Actualizar un producto"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = update_product_command(
                product_id=pk,
                restaurant_id=restaurant_id,
                name=request.data.get('name'),
                price=request.data.get('price'),
                category_id=request.data.get('category_id'),
                image=request.FILES.get('image') or request.data.get('image'),
                description=request.data.get('description')
            )
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Eliminar un producto"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            delete_product_command(pk, restaurant_id)
            return Response(
                {'message': 'Producto eliminado correctamente'},
                status=status.HTTP_204_NO_CONTENT
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ========== OPCIONES ==========

class OptionListCreateView(APIView):
    """Listar y crear opciones"""
    permission_classes = [IsRestaurantOrAdmin]
    
    def get(self, request):
        """Listar opciones de un producto"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response(
                {'error': 'Se requiere product_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        options = list_options_by_product_query(product_id, restaurant_id)
        serializer = ProductOptionSerializer(options, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Crear una nueva opción"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            option = create_option_command(
                name=request.data.get('name'),
                extra_price=request.data.get('extra_price', 0),
                product_id=request.data.get('product_id'),
                restaurant_id=restaurant_id
            )
            serializer = ProductOptionSerializer(option)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class OptionDetailView(APIView):
    """Obtener, actualizar y eliminar una opción"""
    permission_classes = [IsRestaurantOrAdmin]
    
    def get(self, request, pk):
        """Obtener una opción"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        option = get_option_query(pk, restaurant_id)
        if not option:
            return Response(
                {'error': 'Opción no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProductOptionSerializer(option)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Actualizar una opción"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            option = update_option_command(
                option_id=pk,
                restaurant_id=restaurant_id,
                name=request.data.get('name'),
                extra_price=request.data.get('extra_price')
            )
            serializer = ProductOptionSerializer(option)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Eliminar una opción"""
        restaurant_id = getattr(request.user, 'restaurant_id', None)
        if not restaurant_id:
            return Response(
                {'error': 'Usuario no tiene restaurante asociado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            delete_option_command(pk, restaurant_id)
            return Response(
                {'message': 'Opción eliminada correctamente'},
                status=status.HTTP_204_NO_CONTENT
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ========== ENDPOINTS PÚBLICOS ==========

class PublicProductListView(APIView):
    """Endpoint público para listar productos"""
    permission_classes = []
    
    def get(self, request):
        restaurant_id = request.query_params.get('restaurant_id')
        if not restaurant_id:
            return Response(
                {'error': 'Se requiere restaurant_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            restaurant_id = int(restaurant_id)
        except ValueError:
            return Response(
                {'error': 'restaurant_id debe ser un número'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        products = list_products_query(restaurant_id)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class PublicCategoryListView(APIView):
    """Endpoint público para listar categorías"""
    permission_classes = []
    
    def get(self, request):
        restaurant_id = request.query_params.get('restaurant_id')
        if not restaurant_id:
            return Response(
                {'error': 'Se requiere restaurant_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            restaurant_id = int(restaurant_id)
        except ValueError:
            return Response(
                {'error': 'restaurant_id debe ser un número'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        categories = list_categories_query(restaurant_id)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)