"""
Command: Create Category
CQRS - Command para crear una categoría
"""
from ...infrastructure.repositories import CategoryRepository
from ...domain.entities import Category
from menu.application.ports.event_publisher_port import EventPublisherPort


def create_category_command(name: str, restaurant_id: int, event_publisher: EventPublisherPort, actor_username: str = None) -> Category:
    """
    Crea una nueva categoría
    """
    if not name or not name.strip():
        raise ValueError("El nombre de la categoría es requerido")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    category = CategoryRepository.create(
        name=name.strip(),
        restaurant_id=restaurant_id
    )
    
    category.record_created()
    event = category.pull_domain_events()[-1]
    if actor_username:
        event.data['actor_username'] = actor_username
    event_publisher.persist_and_publish(event, 'category.created')
    
    return category