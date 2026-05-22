package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderStatus;

import java.time.Instant;
import java.util.UUID;

public record OrderStatusChangedEvent(
        UUID aggregateId,
        OrderStatus previousStatus,
        OrderStatus newStatus,
        Instant occurredAt
) implements DomainEvent {
    @Override
    public String eventType() {
        return "OrderStatusChanged";
    }
}
