package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.messaging;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports.DomainEventPublisher;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.events.DomainEvent;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.events.JpaEventLogEntity;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.events.SpringDataEventLogRepository;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class RabbitMqDomainEventPublisher implements DomainEventPublisher {
    private final RabbitTemplate rabbitTemplate;
    private final TopicExchange exchange;
    private final SpringDataEventLogRepository eventLogRepository;

    public RabbitMqDomainEventPublisher(RabbitTemplate rabbitTemplate, TopicExchange exchange, SpringDataEventLogRepository eventLogRepository) {
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
        return """
                {"event_type":"%s","aggregate_id":"%s","timestamp":"%s","data":"%s"}
                """.formatted(escape(event.eventType()), event.aggregateId(), event.occurredAt(), escape(event.toString())).trim();
    }

    private String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
