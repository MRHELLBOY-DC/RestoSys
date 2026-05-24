package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentCreatedEvent(UUID aggregateId, UUID orderId, UUID restaurantId, BigDecimal amount, Instant occurredAt) implements DomainEvent {
    @Override
    public String eventType() {
        return "PaymentCreated";
    }
}
