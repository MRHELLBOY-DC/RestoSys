package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events;

import java.time.Instant;
import java.util.UUID;

public record OrderPaidEvent(
        UUID aggregateId,
        Instant occurredAt
) implements DomainEvent {
    @Override
    public String eventType() {
        return "OrderPaid";
    }
}
