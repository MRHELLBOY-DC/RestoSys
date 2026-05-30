package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderCreatedEvent(
        UUID aggregateId,
        UUID restaurantId,
        UUID clientId,
        String orderCode,
        BigDecimal totalAmount,
        Instant occurredAt
) implements DomainEvent {
    @Override
    public String eventType() {
        return "OrderCreated";
    }
}
