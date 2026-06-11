"""
Messaging - Publicador de eventos a RabbitMQ
Capa de Infrastructure - implementación concreta
"""
import json
import os
import logging
import threading
import time
from functools import lru_cache

import pika

logger = logging.getLogger(__name__)


class RabbitMQEventPublisher:
    """
    Publisher de eventos hacia RabbitMQ
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
                    delivery_mode=2,
                    content_type='application/json'
                )
            )
            logger.debug(f"Evento publicado: {event_type}")
            return True
        except Exception as e:
            logger.error(f"Error publicando evento {event_type}: {e}")
            return False
    
    def close(self):
        if self._connection and self._connection.is_open:
            self._connection.close()
            logger.info("Conexión RabbitMQ cerrada")


class RabbitMQEventConsumer:
    """
    Consumidor de eventos desde RabbitMQ
    """
    
    def __init__(self, host=None, port=None, username=None, password=None, exchange=None, queue=None):
        self.host = host or os.environ.get('RABBITMQ_HOST', 'localhost')
        self.port = int(port or os.environ.get('RABBITMQ_PORT', 5672))
        self.username = username or os.environ.get('RABBITMQ_USER', 'guest')
        self.password = password or os.environ.get('RABBITMQ_PASS', 'guest')
        self.exchange = exchange or os.environ.get('RABBITMQ_EXCHANGE', 'events')
        self.queue = queue or os.environ.get('RABBITMQ_QUEUE', 'menu_service')
        self._connection = None
        self._channel = None
        self._handlers = {}
    
    def connect(self):
        """Establece conexión con RabbitMQ y bindea la cola"""
        try:
            credentials = pika.PlainCredentials(self.username, self.password)
            parameters = pika.ConnectionParameters(
                host=self.host,
                port=self.port,
                credentials=credentials,
                heartbeat=3600,
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
            
            # Declarar cola
            self._channel.queue_declare(queue=self.queue, durable=True)
            
            # Bindear la cola con los routing keys de restaurante
            self._channel.queue_bind(
                exchange=self.exchange,
                queue=self.queue,
                routing_key='restaurant.created'
            )
            self._channel.queue_bind(
                exchange=self.exchange,
                queue=self.queue,
                routing_key='restaurant.updated'
            )
            self._channel.queue_bind(
                exchange=self.exchange,
                queue=self.queue,
                routing_key='restaurant.deleted'
            )
            
            logger.info(f"Consumidor conectado a RabbitMQ en {self.host}:{self.port}")
            logger.info(f"Cola '{self.queue}' bindeada a exchange '{self.exchange}' con routing keys 'restaurant.*'")
            return True
        except Exception as e:
            logger.error(f"Error conectando consumidor a RabbitMQ: {e}")
            return False
    
    def register_handler(self, event_type, handler):
        """Registra un handler para un tipo de evento"""
        self._handlers[event_type] = handler
        # Bindear la cola al routing key
        if self._channel:
            self._channel.queue_bind(
                exchange=self.exchange,
                queue=self.queue,
                routing_key=event_type
            )
        logger.info(f"Handler registrado para evento: {event_type}")
    
    def _process_message(self, channel, method, properties, body):
        """Procesa un mensaje recibido"""
        try:
            message = json.loads(body)
            event_type = message.get('event_type')
            data = message.get('data', {})
            
            logger.info(f"Evento recibido: {event_type}")
            
            if event_type in self._handlers:
                self._handlers[event_type](data)
            else:
                logger.warning(f"No hay handler para evento: {event_type}")
            
            # Confirmar procesamiento
            channel.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            logger.error(f"Error procesando mensaje: {e}")
            # Rechazar y reencolar
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
    
    def start(self):
        """Inicia el consumo de eventos"""
        if not self._channel:
            if not self.connect():
                logger.error("No se pudo conectar para iniciar consumo")
                return
        
        self._channel.basic_qos(prefetch_count=1)
        self._channel.basic_consume(
            queue=self.queue,
            on_message_callback=self._process_message
        )
        
        logger.info("Iniciando consumo de eventos...")
        try:
            self._channel.start_consuming()
        except KeyboardInterrupt:
            logger.info("Consumo detenido por usuario")
            self._channel.stop_consuming()
        except Exception as e:
            logger.error(f"Error en consumo: {e}")
    
    def start_in_thread(self):
        """Inicia el consumo en un hilo separado"""
        logger.info("Iniciando consumidor en hilo...")
        logger.info(f"Exchange: {self.exchange}, Queue: {self.queue}")
        thread = threading.Thread(target=self.start, daemon=True)
        thread.start()
        logger.info("Hilo de consumidor iniciado")
        return thread
    
    def close(self):
        """Cierra la conexión"""
        if self._channel and self._channel.is_open:
            self._channel.close()
        if self._connection and self._connection.is_open:
            self._connection.close()
        logger.info("Conexión consumidor cerrada")


# Instancias globales
_event_publisher = None
_event_consumer = None


def get_event_publisher():
    global _event_publisher
    if _event_publisher is None:
        _event_publisher = RabbitMQEventPublisher()
    return _event_publisher


def get_event_consumer():
    global _event_consumer
    if _event_consumer is None:
        _event_consumer = RabbitMQEventConsumer()
    return _event_consumer


def publish_event(event_type, data):
    return get_event_publisher().publish(event_type, data)