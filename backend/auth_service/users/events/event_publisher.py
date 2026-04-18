"""
Event Publisher - Publica eventos a RabbitMQ
Implementa la conexión con el broker de mensajería
"""
import json
import pika
import os
from django.conf import settings


class EventPublisher:
    """
    Publisher de eventos hacia RabbitMQ
    """
    
    def __init__(self):
        self.host = os.environ.get('RABBITMQ_HOST', 'localhost')
        self.port = int(os.environ.get('RABBITMQ_PORT', 5672))
        self.username = os.environ.get('RABBITMQ_USER', 'guest')
        self.password = os.environ.get('RABBITMQ_PASS', 'guest')
        self.exchange = os.environ.get('RABBITMQ_EXCHANGE', 'events')
        self._connection = None
        self._channel = None
    
    def connect(self):
        """Establece conexión con RabbitMQ"""
        try:
            credentials = pika.PlainCredentials(self.username, self.password)
            parameters = pika.ConnectionParameters(
                host=self.host,
                port=self.port,
                credentials=credentials
            )
            self._connection = pika.BlockingConnection(parameters)
            self._channel = self._connection.channel()
            
            # Declarar exchange
            self._channel.exchange_declare(
                exchange=self.exchange,
                exchange_type='topic',
                durable=True
            )
            
            return True
        except Exception as e:
            print(f"Error conectando a RabbitMQ: {e}")
            return False
    
    def publish(self, event_type, data):
        """
        Publica un evento al exchange de RabbitMQ
        Args:
            event_type: Tipo de evento (routing key)
            data: Datos del evento (dict)
        """
        if not self._channel:
            self.connect()
        
        try:
            message = json.dumps({
                'event_type': event_type,
                'data': data,
                'timestamp': data.get('timestamp')
            })
            
            self._channel.basic_publish(
                exchange=self.exchange,
                routing_key=event_type,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Persistente
                    content_type='application/json'
                )
            )
            return True
        except Exception as e:
            print(f"Error publicando evento: {e}")
            return False
    
    def close(self):
        """Cierra la conexión"""
        if self._connection:
            self._connection.close()


# Instancia global del publisher
event_publisher = EventPublisher()


def publish_event(event_type, data):
    """
    Función helper para publicar eventos
    """
    try:
        return event_publisher.publish(event_type, data)
    except Exception as e:
        print(f"Error al publicar evento {event_type}: {e}")
        return False