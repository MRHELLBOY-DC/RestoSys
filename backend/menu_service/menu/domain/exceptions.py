"""
Domain Exceptions - Excepciones específicas del negocio para el módulo de menú
"""

class DomainException(Exception):
    """Excepción base para todas las excepciones de dominio"""
    pass

# ============================================
# Category Exceptions
# ============================================

class CategoryException(DomainException):
    """Excepción base para errores de categoría"""
    pass


class CategoryNotFoundException(CategoryException):
    """Categoría no encontrada"""
    def __init__(self, category_id: int):
        self.category_id = category_id
        super().__init__(f"Categoría con ID '{category_id}' no encontrada.")


class InvalidCategoryNameException(CategoryException):
    """Nombre de categoría inválido"""
    def __init__(self, reason: str):
        self.reason = reason
        super().__init__(f"Nombre de categoría inválido: {reason}")


class CategoryHasProductsException(CategoryException):
    """Categoría tiene productos asociados y no puede ser eliminada"""
    def __init__(self, category_id: int, product_count: int):
        self.category_id = category_id
        self.product_count = product_count
        super().__init__(
            f"No se puede eliminar la categoría con ID '{category_id}'. "
            f"Tiene {product_count} producto(s) asociado(s)."
        )

# ============================================
# Product Exceptions
# ============================================

class ProductException(DomainException):
    """Excepción base para errores de producto"""
    pass


class ProductNotFoundException(ProductException):
    """Producto no encontrado"""
    def __init__(self, product_id: int):
        self.product_id = product_id
        super().__init__(f"Producto con ID '{product_id}' no encontrado.")


class InvalidProductDataException(ProductException):
    """Datos de producto inválidos"""
    def __init__(self, field: str, reason: str):
        self.field = field
        super().__init__(f"Dato inválido para '{field}': {reason}")


class ProductHasOptionsException(ProductException):
    """Producto tiene opciones asociadas y no puede ser eliminado"""
    def __init__(self, product_id: int, option_count: int):
        self.product_id = product_id
        self.option_count = option_count
        super().__init__(
            f"No se puede eliminar el producto con ID '{product_id}'. "
            f"Tiene {option_count} opción(es) asociada(s)."
        )


class ProductHasActiveOrdersException(ProductException):
    """Producto tiene pedidos activos y no puede ser eliminado"""
    def __init__(self, product_id: int, order_count: int):
        self.product_id = product_id
        self.order_count = order_count
        super().__init__(
            f"No se puede eliminar el producto con ID '{product_id}'. "
            f"Tiene {order_count} pedido(s) activo(s)."
        )

# ============================================
# Option Exceptions
# ============================================

class OptionException(DomainException):
    """Excepción base para errores de opción"""
    pass


class OptionNotFoundException(OptionException):
    """Opción no encontrada"""
    def __init__(self, option_id: int):
        self.option_id = option_id
        super().__init__(f"Opción con ID '{option_id}' no encontrada.")


class InvalidOptionDataException(OptionException):
    """Datos de opción inválidos"""
    def __init__(self, field: str, reason: str):
        self.field = field
        super().__init__(f"Dato inválido para '{field}': {reason}")


class OptionPriceExceedsProductPriceException(OptionException):
    """El precio extra de la opción excede el precio del producto"""
    def __init__(self, option_price: Decimal, product_price: Decimal):
        self.option_price = option_price
        self.product_price = product_price
        super().__init__(
            f"El precio extra de la opción ({option_price}) "
            f"no puede exceder el precio del producto ({product_price})."
        )

# ============================================
# Restaurant Validation Exceptions
# ============================================

class RestaurantAccessDeniedException(DomainException):
    """El usuario no tiene acceso a este restaurante"""
    def __init__(self, user_id: int, restaurant_id: int):
        self.user_id = user_id
        self.restaurant_id = restaurant_id
        super().__init__(f"Usuario {user_id} no tiene acceso al restaurante {restaurant_id}.")