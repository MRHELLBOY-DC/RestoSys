from dataclasses import dataclass
from typing import Optional, Any
from django.db import transaction
from .base_command import Command, CommandHandler
from .create_user import CreateUserCommand
from .create_restaurant import CreateRestaurantCommand
from .assign_restaurant import AssignRestaurantCommand


@dataclass
class CreateRestaurantWizardCommand(Command):
    """Command que agrupa los datos de los 2 pasos del wizard: usuario + restaurante"""
    # Paso 1: usuario del restaurante
    user_email: str
    user_password: str
    user_full_name: str = ""
    user_username: Optional[str] = None
    # Paso 2: datos del restaurante
    restaurant_name: str = ""
    restaurant_address: str = ""
    restaurant_phone: Optional[str] = None
    restaurant_lat: Optional[float] = None
    restaurant_lng: Optional[float] = None
    restaurant_delivery_fee: Optional[float] = None
    restaurant_logo: Optional[Any] = None
    actor_username: Optional[str] = None


class CreateRestaurantWizardCommandHandler(CommandHandler):
    """
    Orquesta el registro completo: NO reimplementa lógica de negocio.
    Ejecuta, en orden, los commands que ya existen:
    CreateUserCommand -> CreateRestaurantCommand -> AssignRestaurantCommand
    """

    def __init__(self, command_bus):
        self.command_bus = command_bus

    def handle(self, command: CreateRestaurantWizardCommand):
        with transaction.atomic():
            # 1. Crear el usuario del restaurante (rol fijo 'restaurante')
            saved_user = self.command_bus.execute(CreateUserCommand(
                email=command.user_email,
                password=command.user_password,
                username=command.user_username,
                role="restaurante",
                full_name=command.user_full_name,
                actor_username=command.actor_username,
            ))

            # 2. Crear el restaurante
            saved_restaurant = self.command_bus.execute(CreateRestaurantCommand(
                name=command.restaurant_name,
                address=command.restaurant_address,
                phone=command.restaurant_phone,
                lat=command.restaurant_lat,
                lng=command.restaurant_lng,
                delivery_fee=command.restaurant_delivery_fee,
                logo=command.restaurant_logo,
                actor_username=command.actor_username,
            ))

            # 3. Asignar el usuario recien creado al restaurante recien creado
            self.command_bus.execute(AssignRestaurantCommand(
                user_id=saved_user.id,
                restaurant_id=saved_restaurant.id,
                actor_username=command.actor_username,
            ))

        return saved_user, saved_restaurant
