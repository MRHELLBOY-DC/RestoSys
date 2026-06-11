"""
Handlers para eventos de restaurante provenientes de auth_service
Nota: menu_service no tiene modelo Restaurant, solo usa restaurant_id en Category/Product
"""
import logging

logger = logging.getLogger(__name__)


def handle_restaurant_created(data):
    """Maneja evento restaurant.created - Solo loguea"""
    restaurant_id = data.get('restaurant_id')
    name = data.get('name')
    address = data.get('address', '')
    
    logger.info(f"EVENTO RECIBIDO - restaurant.created | ID={restaurant_id} | Name={name}")
    print(f"MENU SERVICE RECIBIÓ EVENTO: restaurant.created - {name} (ID: {restaurant_id})")


def handle_restaurant_updated(data):
    """Maneja evento restaurant.updated - Solo loguea"""
    restaurant_id = data.get('restaurant_id')
    logger.info(f"Evento restaurant.updated recibido: id={restaurant_id}")


def handle_restaurant_deleted(data):
    """Maneja evento restaurant.deleted - Solo loguea"""
    restaurant_id = data.get('restaurant_id')
    logger.info(f"Evento restaurant.deleted recibido: id={restaurant_id}")
    logger.info(f"   Nota: Las categorías y productos con restaurant_id={restaurant_id} no se eliminan automáticamente")


def register_restaurant_handlers(consumer):
    """Registra todos los handlers de restaurante en el consumidor"""
    consumer.register_handler('restaurant.created', handle_restaurant_created)
    consumer.register_handler('restaurant.updated', handle_restaurant_updated)
    consumer.register_handler('restaurant.deleted', handle_restaurant_deleted)
    logger.info("Handlers de restaurante registrados")