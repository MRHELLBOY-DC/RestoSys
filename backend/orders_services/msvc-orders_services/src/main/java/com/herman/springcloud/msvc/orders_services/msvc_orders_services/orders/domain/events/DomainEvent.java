package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events;

import java.time.Instant;
import java.util.UUID;

public interface DomainEvent {
    UUID aggregateId();

    String eventType();

    Instant occurredAt();
}
