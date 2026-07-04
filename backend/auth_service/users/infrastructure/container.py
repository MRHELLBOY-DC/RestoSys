from users.infrastructure.event_store import EventStore
from users.infrastructure.repositories import UserRepository, RestaurantRepository, UserRestaurantRepository
from users.infrastructure.event_utils import EventPublisher
from users.infrastructure.authentication import DjangoAuthenticationService
from users.infrastructure.hashing import DjangoHashingService

# Command y Query buses
from users.application.commands.base_command import CommandBus
from users.application.queries.base_query import QueryBus
from users.application.commands.create_user import CreateUserCommand, CreateUserCommandHandler
from users.application.commands.update_user import UpdateUserCommand, UpdateUserCommandHandler
from users.application.commands.delete_user import DeleteUserCommand, DeleteUserCommandHandler
from users.application.commands.create_restaurant import CreateRestaurantCommand, CreateRestaurantCommandHandler
from users.application.commands.update_restaurant import UpdateRestaurantCommand, UpdateRestaurantCommandHandler
from users.application.commands.delete_restaurant import DeleteRestaurantCommand, DeleteRestaurantCommandHandler
from users.application.commands.assign_restaurant import AssignRestaurantCommand, AssignRestaurantCommandHandler
from users.application.commands.unassign_restaurant import UnassignRestaurantCommand, UnassignRestaurantCommandHandler
from users.application.commands.login import LoginCommand, LoginCommandHandler
from users.application.queries.list_users import ListUsersQuery, ListUsersQueryHandler
from users.application.queries.get_user_details import GetUserDetailsQuery, GetUserDetailsQueryHandler
from users.application.queries.get_event_history import (
    GetUserEventsQuery, GetUserEventsQueryHandler,
    GetAllEventsQuery, GetAllEventsQueryHandler
)
from users.application.queries.get_restaurant_queries import (
    ListRestaurantsQuery, ListRestaurantsQueryHandler,
    GetUserRestaurantQuery, GetUserRestaurantQueryHandler
)
from users.application.queries.get_profile import GetProfileQuery, GetProfileQueryHandler
from users.application.queries.get_restaurant_details import (
    GetRestaurantDetailsQuery,
    GetRestaurantDetailsQueryHandler,
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
        self.user_repo = UserRepository()
        self.restaurant_repo = RestaurantRepository()
        self.user_restaurant_repo = UserRestaurantRepository()
        
        # Servicios
        self.event_store = EventStore()
        self.hashing_service = DjangoHashingService()
        
        # Buses
        self.command_bus = CommandBus()
        self.query_bus = QueryBus()
        
        # Cache de handlers
        self._handlers_cache = {}
        
        # =====================
        # FACTORY DICCIONARIOS
        # =====================
        
        self._command_handlers_factory = {
            CreateUserCommand: lambda: CreateUserCommandHandler(
                self.user_repo,
                self.user_restaurant_repo,
                self.event_publisher,
                self.hashing_service
            ),
            UpdateUserCommand: lambda: UpdateUserCommandHandler(
                self.user_repo,
                self.user_restaurant_repo,
                self.event_publisher
            ),
            DeleteUserCommand: lambda: DeleteUserCommandHandler(self.user_repo, self.event_publisher),
            CreateRestaurantCommand: lambda: CreateRestaurantCommandHandler(self.restaurant_repo, self.event_publisher),
            UpdateRestaurantCommand: lambda: UpdateRestaurantCommandHandler(self.restaurant_repo, self.event_publisher),
            DeleteRestaurantCommand: lambda: DeleteRestaurantCommandHandler(self.restaurant_repo, self.event_publisher),
            AssignRestaurantCommand: lambda: AssignRestaurantCommandHandler(
                self.user_repo, self.restaurant_repo, self.user_restaurant_repo
            ),
            UnassignRestaurantCommand: lambda: UnassignRestaurantCommandHandler(self.user_repo, self.user_restaurant_repo),
            LoginCommand: lambda: LoginCommandHandler(
                self.user_repo, self.auth_service, self.event_publisher, self.query_bus
            ),
        }
        
        self._query_handlers_factory = {
            ListUsersQuery: lambda: ListUsersQueryHandler(
                self.user_repo,
                self.user_restaurant_repo
            ),
            GetUserDetailsQuery: lambda: GetUserDetailsQueryHandler(
                self.user_repo, self.user_restaurant_repo, self.restaurant_repo
            ),
            GetUserEventsQuery: lambda: GetUserEventsQueryHandler(self.event_store),
            GetAllEventsQuery: lambda: GetAllEventsQueryHandler(self.event_store),
            ListRestaurantsQuery: lambda: ListRestaurantsQueryHandler(self.restaurant_repo),
            GetUserRestaurantQuery: lambda: GetUserRestaurantQueryHandler(self.user_restaurant_repo, self.restaurant_repo),
            GetProfileQuery: lambda: GetProfileQueryHandler(),
            GetRestaurantDetailsQuery: lambda: GetRestaurantDetailsQueryHandler(
                self.restaurant_repo,
                self.user_restaurant_repo
            ),
        }
        
        # Flags de registro
        self._command_handlers_registered = False
        self._query_handlers_registered = False
    
    # ============================================
    # LAZY PROPERTIES (creados bajo demanda)
    # ============================================
    
    @property
    def event_publisher(self):
        if not hasattr(self, '_event_publisher'):
            self._event_publisher = EventPublisher(event_store=self.event_store)
        return self._event_publisher
    
    @property
    def auth_service(self):
        if not hasattr(self, '_auth_service'):
            self._auth_service = DjangoAuthenticationService(
                user_restaurant_repo=self.user_restaurant_repo,
                restaurant_repo=self.restaurant_repo
            )
        return self._auth_service
    
    # ============================================
    # MÉTODOS DE ACCESO (con lazy registration)
    # ============================================
    
    def _ensure_command_handlers_registered(self):
        if not self._command_handlers_registered:
            for cmd_class, factory in self._command_handlers_factory.items():
                self.command_bus.register(cmd_class, factory())
            self._command_handlers_registered = True
    
    def _ensure_query_handlers_registered(self):
        if not self._query_handlers_registered:
            for query_class, factory in self._query_handlers_factory.items():
                self.query_bus.register(query_class, factory())
            self._query_handlers_registered = True
    
    def execute_command(self, command):
        self._ensure_command_handlers_registered()
        self._ensure_query_handlers_registered()
        return self.command_bus.execute(command)
    
    def execute_query(self, query):
        self._ensure_query_handlers_registered()
        return self.query_bus.execute(query)

container = Container()