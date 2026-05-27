"""
Command: Create Category
CQRS - Command para crear una categoría
"""
from ...infrastructure.repositories import CategoryRepository
from ...infrastructure.event_utils import persist_and_publish
from ...domain.entities import Category


def create_category_command(name: str, restaurant_id: int) -> Category:
    """
    Crea una nueva categoría
    """
    # Validaciones
    if not name or not name.strip():
        raise ValueError("El nombre de la categoría es requerido")
    
    if not restaurant_id:
        raise ValueError("Se requiere restaurant_id")
    
    # Crear categoría
    category = CategoryRepository.create(
        name=name.strip(),
        restaurant_id=restaurant_id
    )
    
    category.record_created()
    event = category.pull_domain_events()[-1]
    persist_and_publish(event, 'category.created')
    
    return category