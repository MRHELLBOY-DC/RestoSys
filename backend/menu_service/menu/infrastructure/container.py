"""
Contenedor de dependencias - Capa de Infrastructure
Patrón Factory con diccionarios (como en auth_service)
"""
from menu.infrastructure.repositories import (
    CategoryRepository,
    ProductRepository,
    ProductOptionRepository,
)
from menu.infrastructure.event_utils import EventPublisher
from menu.infrastructure.event_store import EventStore

# Importar Command y Query buses
from menu.application.commands.base_command import CommandBus
from menu.application.queries.base_query import QueryBus

# Importar Commands y Handlers de Category
from menu.application.commands.create_category import (
    CreateCategoryCommand,
    CreateCategoryCommandHandler,
)
from menu.application.commands.update_category import (
    UpdateCategoryCommand,
    UpdateCategoryCommandHandler,
)
from menu.application.commands.delete_category import (
    DeleteCategoryCommand,
    DeleteCategoryCommandHandler,
)

# Importar Commands y Handlers de Product
from menu.application.commands.create_product import (
    CreateProductCommand,
    CreateProductCommandHandler,
)
from menu.application.commands.update_product import (
    UpdateProductCommand,
    UpdateProductCommandHandler,
)
from menu.application.commands.delete_product import (
    DeleteProductCommand,
    DeleteProductCommandHandler,
)

# Importar Commands y Handlers de Option
from menu.application.commands.create_option import (
    CreateOptionCommand,
    CreateOptionCommandHandler,
)
from menu.application.commands.update_option import (
    UpdateOptionCommand,
    UpdateOptionCommandHandler,
)
from menu.application.commands.delete_option import (
    DeleteOptionCommand,
    DeleteOptionCommandHandler,
)

# Importar Queries y Handlers de Category
from menu.application.queries.list_categories import (
    ListCategoriesQuery,
    ListCategoriesQueryHandler,
    GetCategoryQuery,
    GetCategoryQueryHandler,
)

# Importar Queries y Handlers de Product
from menu.application.queries.list_products import (
    ListProductsQuery,
    ListProductsQueryHandler,
    GetProductQuery,
    GetProductQueryHandler,
)

# Importar Queries y Handlers de Option
from menu.application.queries.list_options import (
    ListOptionsByProductQuery,
    ListOptionsByProductQueryHandler,
    GetOptionQuery,
    GetOptionQueryHandler,
)


class Container:
    """Contenedor de dependencias con lazy loading (singleton)"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._initialize()
            self._initialized = True
    
    def _initialize(self):
        """Inicialización básica (solo lo esencial)"""
        # Repositorios
        self.category_repo = CategoryRepository()
        self.product_repo = ProductRepository()
        self.option_repo = ProductOptionRepository()
        
        # Event Store
        self.event_store = EventStore()
        
        # Command y Query buses
        self.command_bus = CommandBus()
        self.query_bus = QueryBus()
        
        # ============================================
        # FACTORY DICCIONARIOS
        # ============================================
        
        self._command_handlers_factory = {
            # Category Commands
            CreateCategoryCommand: lambda: CreateCategoryCommandHandler(
                self.category_repo, self.event_publisher
            ),
            UpdateCategoryCommand: lambda: UpdateCategoryCommandHandler(
                self.category_repo, self.event_publisher
            ),
            DeleteCategoryCommand: lambda: DeleteCategoryCommandHandler(
                self.category_repo, self.event_publisher
            ),
            
            # Product Commands
            CreateProductCommand: lambda: CreateProductCommandHandler(
                self.product_repo, self.category_repo, self.event_publisher
            ),
            UpdateProductCommand: lambda: UpdateProductCommandHandler(
                self.product_repo, self.category_repo, self.event_publisher
            ),
            DeleteProductCommand: lambda: DeleteProductCommandHandler(
                self.product_repo, self.event_publisher
            ),
            
            # Option Commands
            CreateOptionCommand: lambda: CreateOptionCommandHandler(
                self.option_repo, self.product_repo, self.event_publisher
            ),
            UpdateOptionCommand: lambda: UpdateOptionCommandHandler(
                self.option_repo, self.event_publisher
            ),
            DeleteOptionCommand: lambda: DeleteOptionCommandHandler(
                self.option_repo, self.event_publisher
            ),
        }
        
        self._query_handlers_factory = {
            # Category Queries
            ListCategoriesQuery: lambda: ListCategoriesQueryHandler(self.category_repo),
            GetCategoryQuery: lambda: GetCategoryQueryHandler(self.category_repo),
            
            # Product Queries
            ListProductsQuery: lambda: ListProductsQueryHandler(self.product_repo),
            GetProductQuery: lambda: GetProductQueryHandler(self.product_repo),
            
            # Option Queries
            ListOptionsByProductQuery: lambda: ListOptionsByProductQueryHandler(
                self.option_repo, self.product_repo
            ),
            GetOptionQuery: lambda: GetOptionQueryHandler(self.option_repo),
        }
        
        # Flags de registro
        self._command_handlers_registered = False
        self._query_handlers_registered = False
    
    # ============================================
    # LAZY PROPERTIES
    # ============================================
    
    @property
    def event_publisher(self):
        """EventPublisher - creado bajo demanda"""
        if not hasattr(self, '_event_publisher'):
            self._event_publisher = EventPublisher(event_store=self.event_store)
        return self._event_publisher
    
    # ============================================
    # MÉTODOS DE ACCESO
    # ============================================
    
    def _ensure_command_handlers_registered(self):
        """Registra command handlers en command bus (solo una vez)"""
        if not self._command_handlers_registered:
            for cmd_class, factory in self._command_handlers_factory.items():
                self.command_bus.register(cmd_class, factory())
            self._command_handlers_registered = True
    
    def _ensure_query_handlers_registered(self):
        """Registra query handlers en query bus (solo una vez)"""
        if not self._query_handlers_registered:
            for query_class, factory in self._query_handlers_factory.items():
                self.query_bus.register(query_class, factory())
            self._query_handlers_registered = True
    
    def execute_command(self, command):
        """Ejecuta un comando (registra handlers si es necesario)"""
        self._ensure_command_handlers_registered()
        return self.command_bus.execute(command)
    
    def execute_query(self, query):
        """Ejecuta una query (registra handlers si es necesario)"""
        self._ensure_query_handlers_registered()
        return self.query_bus.execute(query)

container = Container()