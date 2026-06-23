"""
API Views - Endpoints que usan commands y queries
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .permissions import IsRestaurantOrAdmin
from ..serializers import CategorySerializer, ProductSerializer, ProductOptionSerializer

# Importar Container
from ...infrastructure.container import container

# Importar Commands y Queries de Category
from ...application.commands.create_category import CreateCategoryCommand
from ...application.commands.update_category import UpdateCategoryCommand
from ...application.commands.delete_category import DeleteCategoryCommand
from ...application.queries.list_categories import ListCategoriesQuery, GetCategoryQuery

# Importar Commands y Queries de Product
from ...application.commands.create_product import CreateProductCommand
from ...application.commands.update_product import UpdateProductCommand
from ...application.commands.delete_product import DeleteProductCommand
from ...application.queries.list_products import ListProductsQuery, GetProductQuery

# Importar Commands y Queries de Option
from ...application.commands.create_option import CreateOptionCommand
from ...application.commands.update_option import UpdateOptionCommand
from ...application.commands.delete_option import DeleteOptionCommand
from ...application.queries.list_options import ListOptionsByProductQuery, GetOptionQuery


# ========== CATEGORÍAS (REFACTORIZADO) ==========

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
        
        query = ListCategoriesQuery(restaurant_id=restaurant_id)
        categories = container.execute_query(query)
        
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
            command = CreateCategoryCommand(
                name=name,
                restaurant_id=restaurant_id,
                actor_username=request.user.username
            )
            category = container.execute_command(command)
            
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
        
        query = GetCategoryQuery(category_id=pk, restaurant_id=restaurant_id)
        category = container.execute_query(query)
        
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
            command = UpdateCategoryCommand(
                category_id=pk,
                name=name,
                restaurant_id=restaurant_id,
                actor_username=request.user.username
            )
            category = container.execute_command(command)
            
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
            command = DeleteCategoryCommand(
                category_id=pk,
                restaurant_id=restaurant_id,
                actor_username=request.user.username
            )
            container.execute_command(command)
            
            return Response(
                {'message': 'Categoría eliminada correctamente'},
                status=status.HTTP_204_NO_CONTENT
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ========== PRODUCTOS (REFACTORIZADO) ==========

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
        if category_id:
            try:
                category_id = int(category_id)
            except ValueError:
                return Response(
                    {'error': 'category_id debe ser un número'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        query = ListProductsQuery(
            restaurant_id=restaurant_id,
            category_id=category_id
        )
        products = container.execute_query(query)
        
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
        
        # Manejar imagen si viene como archivo
        image = None
        if 'image' in request.FILES:
            image = request.FILES['image']
        elif request.data.get('image'):
            image = request.data.get('image')
        
        try:
            from decimal import Decimal
            price = request.data.get('price')
            if price:
                price = Decimal(str(price))
            
            command = CreateProductCommand(
                name=request.data.get('name'),
                price=price,
                category_id=int(request.data.get('category_id')),
                restaurant_id=restaurant_id,
                image=image,
                description=request.data.get('description'),
                actor_username=request.user.username
            )
            product = container.execute_command(command)
            
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
        
        query = GetProductQuery(product_id=pk, restaurant_id=restaurant_id)
        product = container.execute_query(query)
        
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
        
        # Manejar imagen
        image = None
        if 'image' in request.FILES:
            image = request.FILES['image']
        elif request.data.get('image'):
            image = request.data.get('image')
        
        try:
            command = UpdateProductCommand(
                product_id=pk,
                restaurant_id=restaurant_id,
                name=request.data.get('name'),
                price=request.data.get('price'),
                category_id=request.data.get('category_id'),
                image=image,
                description=request.data.get('description'),
                actor_username=request.user.username
            )
            product = container.execute_command(command)
            
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
            command = DeleteProductCommand(
                product_id=pk,
                restaurant_id=restaurant_id,
                actor_username=request.user.username
            )
            container.execute_command(command)
            
            return Response(
                {'message': 'Producto eliminado correctamente'},
                status=status.HTTP_204_NO_CONTENT
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ========== OPCIONES (REFACTORIZADO) ==========

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
        
        try:
            product_id = int(product_id)
        except ValueError:
            return Response(
                {'error': 'product_id debe ser un número'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        query = ListOptionsByProductQuery(
            product_id=product_id,
            restaurant_id=restaurant_id
        )
        options = container.execute_query(query)
        
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
            from decimal import Decimal
            extra_price = request.data.get('extra_price', 0)
            if isinstance(extra_price, str):
                extra_price = Decimal(extra_price)
            elif isinstance(extra_price, (int, float)):
                extra_price = Decimal(str(extra_price))
            
            command = CreateOptionCommand(
                name=request.data.get('name'),
                extra_price=extra_price,
                product_id=int(request.data.get('product_id')),
                restaurant_id=restaurant_id,
                actor_username=request.user.username
            )
            option = container.execute_command(command)
            
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
        
        query = GetOptionQuery(option_id=pk, restaurant_id=restaurant_id)
        option = container.execute_query(query)
        
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
            from decimal import Decimal
            extra_price = request.data.get('extra_price')
            if extra_price is not None:
                if isinstance(extra_price, str):
                    extra_price = Decimal(extra_price)
                elif isinstance(extra_price, (int, float)):
                    extra_price = Decimal(str(extra_price))
            
            command = UpdateOptionCommand(
                option_id=pk,
                restaurant_id=restaurant_id,
                name=request.data.get('name'),
                extra_price=extra_price,
                actor_username=request.user.username
            )
            option = container.execute_command(command)
            
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
            command = DeleteOptionCommand(
                option_id=pk,
                restaurant_id=restaurant_id,
                actor_username=request.user.username
            )
            container.execute_command(command)
            
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
        
        query = ListProductsQuery(restaurant_id=restaurant_id)
        products = container.execute_query(query)
        
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
        
        query = ListCategoriesQuery(restaurant_id=restaurant_id)
        categories = container.execute_query(query)
        
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)