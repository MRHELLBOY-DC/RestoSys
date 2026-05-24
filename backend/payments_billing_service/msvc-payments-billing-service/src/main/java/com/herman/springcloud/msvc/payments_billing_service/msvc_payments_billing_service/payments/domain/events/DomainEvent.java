package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.events;

import java.time.Instant;
import java.util.UUID;

public interface DomainEvent {
    UUID aggregateId();
    String eventType();
    Instant occurredAt();
}
