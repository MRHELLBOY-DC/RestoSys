"""
Messaging - Configuración compartida de RabbitMQ
"""
import json
import os
import logging
from functools import lru_cache

import pika

# Configurar logging
logger = logging.getLogger(__name__)


class EventPublisher:
    """
    Publisher de eventos hacia RabbitMQ
    Reutilizable por cualquier servicio
    """
    
    def __init__(self, host=None, port=None, username=None, password=None, exchange=None):
        self.host = host or os.environ.get('RABBITMQ_HOST', 'localhost')
        self.port = int(port or os.environ.get('RABBITMQ_PORT', 5672))
        self.username = username or os.environ.get('RABBITMQ_USER', 'guest')
        self.password = password or os.environ.get('RABBITMQ_PASS', 'guest')
        self.exchange = exchange or os.environ.get('RABBITMQ_EXCHANGE', 'events')
        self._connection = None
        self._channel = None
    
    def connect(self):
        """Establece conexión con RabbitMQ"""
        try:
            credentials = pika.PlainCredentials(self.username, self.password)
            parameters = pika.ConnectionParameters(
                host=self.host,
                port=self.port,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300
            )
            self._connection = pika.BlockingConnection(parameters)
            self._channel = self._connection.channel()
            
            # Declarar exchange
            self._channel.exchange_declare(
                exchange=self.exchange,
                exchange_type='topic',
                durable=True
            )
            
            logger.info(f"Conectado a RabbitMQ en {self.host}:{self.port}")
            return True
        except Exception as e:
            logger.error(f"Error conectando a RabbitMQ: {e}")
            return False
    
    def publish(self, event_type, data, routing_key=None):
        """
        Publica un evento al exchange de RabbitMQ
        Args:
            event_type: Tipo de evento (routing key)
            data: Datos del evento (dict)
            routing_key: Routing key opcional (por defecto usa event_type)
        """
        if not self._channel:
            if not self.connect():
                return False
        
        try:
            routing = routing_key or event_type
            message = json.dumps({
                'event_type': event_type,
                'data': data,
                'timestamp': data.get('timestamp') if data else None
            }, default=str)
            
            self._channel.basic_publish(
                exchange=self.exchange,
                routing_key=routing,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Persistente
                    content_type='application/json'
                )
            )
            logger.debug(f"Evento publicado: {event_type}")
            return True
        except Exception as e:
            logger.error(f"Error publicando evento {event_type}: {e}")
            return False
    
    def close(self):
        """Cierra la conexión"""
        if self._connection and self._connection.is_open:
            self._connection.close()
            logger.info("Conexión RabbitMQ cerrada")


# Instancia global (singleton por configuración)
_event_publisher = None


def get_event_publisher():
    """Retorna la instancia global del publisher (singleton)"""
    global _event_publisher
    if _event_publisher is None:
        _event_publisher = EventPublisher()
    return _event_publisher


def publish_event(event_type, data):
    """Función helper para publicar eventos"""
    return get_event_publisher().publish(event_type, data)