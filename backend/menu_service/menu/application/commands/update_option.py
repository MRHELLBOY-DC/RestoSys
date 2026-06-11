"""
Command: Update Option
CQRS - Command para actualizar una opción de producto usando Command pattern
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional
from datetime import datetime
from .base_command import Command, CommandHandler
from menu.application.ports.option_repository_port import OptionRepositoryPort
from menu.application.ports.event_publisher_port import EventPublisherPort
from menu.domain.entities.product_option import ProductOption
from menu.domain.exceptions import OptionNotFoundException, InvalidOptionDataException
from menu.domain.shared.domain_event import DomainEvent


@dataclass
class UpdateOptionCommand(Command):
    """Command to update a product option"""
    option_id: int
    restaurant_id: int
    name: Optional[str] = None
    extra_price: Optional[Decimal] = None
    actor_username: Optional[str] = None


class UpdateOptionCommandHandler(CommandHandler):
    """Handler for UpdateOptionCommand"""
    
    def __init__(
        self,
        option_repo: OptionRepositoryPort,
        event_publisher: EventPublisherPort
    ):
        self.option_repo = option_repo
        self.event_publisher = event_publisher
    
    def handle(self, command: UpdateOptionCommand) -> ProductOption:
        """Execute the command - updates a product option"""
        
        # Validaciones básicas
        if not command.option_id:
            raise ValueError("Se requiere option_id")
        
        if not command.restaurant_id:
            raise ValueError("Se requiere restaurant_id")
        
        # Verificar que la opción existe
        existing_option = self.option_repo.get_by_id(command.option_id, command.restaurant_id)
        if not existing_option:
            raise OptionNotFoundException(command.option_id)
        
        # Obtener datos antiguos
        old_data = {
            'name': existing_option.name,
            'extra_price': str(existing_option.extra_price),
        }
        
        # Validar usando la entidad
        update_data = {}
        
        if command.name is not None:
            try:
                # Crear entidad temporal para validar el nombre
                ProductOption(
                    name=command.name.strip(),
                    extra_price=existing_option.extra_price,
                    product_id=existing_option.product_id
                )
                update_data['name'] = command.name.strip()
            except InvalidOptionDataException as e:
                raise e
        
        if command.extra_price is not None:
            try:
                # Crear entidad temporal para validar el precio
                ProductOption(
                    name=existing_option.name,
                    extra_price=command.extra_price,
                    product_id=existing_option.product_id
                )
                update_data['extra_price'] = command.extra_price
            except InvalidOptionDataException as e:
                raise e
        
        # Actualizar opción
        option = self.option_repo.update(
            command.option_id,
            command.restaurant_id,
            **update_data
        )
        
        if not option:
            raise OptionNotFoundException(command.option_id)
        
        # Publicar evento de dominio
        event_data = {
            'option_id': option.id,
            'restaurant_id': command.restaurant_id,
            'product_id': option.product_id,
            'old_data': old_data,
            'new_data': update_data,
        }
        if command.actor_username:
            event_data['actor_username'] = command.actor_username
        
        event = DomainEvent(
            event_type='OptionUpdated',
            aggregate_id=str(command.option_id),
            aggregate_type='ProductOption',
            data=event_data,
            occurred_at=datetime.utcnow().isoformat()
        )
        
        self.event_publisher.persist_and_publish(event, 'option.updated')
        
        return option