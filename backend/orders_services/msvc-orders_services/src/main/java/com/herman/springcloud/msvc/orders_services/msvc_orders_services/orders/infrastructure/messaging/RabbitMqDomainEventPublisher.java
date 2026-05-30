package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.messaging;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports.DomainEventPublisher;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events.DomainEvent;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events.OrderCreatedEvent;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events.OrderPaidEvent;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events.OrderStatusChangedEvent;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.events.JpaEventLogEntity;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.events.SpringDataEventLogRepository;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class RabbitMqDomainEventPublisher implements DomainEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final TopicExchange exchange;
    private final SpringDataEventLogRepository eventLogRepository;

    public RabbitMqDomainEventPublisher(RabbitTemplate rabbitTemplate, TopicExchange exchange,
                                        SpringDataEventLogRepository eventLogRepository) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchange = exchange;
        this.eventLogRepository = eventLogRepository;
    }

    @Override
    public void publish(DomainEvent event) {
        String payload = toJson(event);
        saveEvent(event, payload);
        rabbitTemplate.convertAndSend(exchange.getName(), event.eventType(), payload);
    }

    private void saveEvent(DomainEvent event, String payload) {
        JpaEventLogEntity entity = new JpaEventLogEntity();
        entity.setId(UUID.randomUUID());
        entity.setAggregateId(event.aggregateId());
        entity.setEventType(event.eventType());
        entity.setPayload(payload);
        entity.setOccurredAt(event.occurredAt());
        eventLogRepository.save(entity);
    }

    private String toJson(DomainEvent event) {
        String dataJson;
        if (event instanceof OrderCreatedEvent e) {
            dataJson = String.format(
                "{\"aggregateId\":\"%s\",\"restaurantId\":\"%s\",\"clientId\":%s,\"orderCode\":\"%s\",\"totalAmount\":%s,\"occurredAt\":\"%s\",\"eventType\":\"OrderCreated\"}",
                e.aggregateId(),
                e.restaurantId(),
                e.clientId() != null ? "\"" + e.clientId() + "\"" : "null",
                e.orderCode(),
                e.totalAmount(),
                e.occurredAt()
            );
        } else if (event instanceof OrderStatusChangedEvent e) {
            dataJson = String.format(
                "{\"aggregateId\":\"%s\",\"restaurantId\":\"%s\",\"orderCode\":\"%s\",\"previousStatus\":\"%s\",\"newStatus\":\"%s\",\"occurredAt\":\"%s\",\"eventType\":\"OrderStatusChanged\"}",
                e.aggregateId(),
                e.restaurantId(),
                e.orderCode(),
                e.previousStatus(),
                e.newStatus(),
                e.occurredAt()
            );
        } else if (event instanceof OrderPaidEvent e) {
            dataJson = String.format(
                "{\"aggregateId\":\"%s\",\"restaurantId\":\"%s\",\"occurredAt\":\"%s\",\"eventType\":\"OrderPaid\"}",
                e.aggregateId(),
                e.restaurantId(),
                e.occurredAt()
            );
        } else {
            dataJson = "\"" + escape(event.toString()) + "\"";
        }

        return String.format(
            "{\"event_type\":\"%s\",\"aggregate_id\":\"%s\",\"timestamp\":\"%s\",\"data\":%s}",
            event.eventType(),
            event.aggregateId(),
            event.occurredAt(),
            dataJson
        );
    }

    private String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
