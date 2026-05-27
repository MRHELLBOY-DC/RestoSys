package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.events;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentConfirmedEvent(UUID aggregateId, UUID orderId, UUID restaurantId, UUID clientId, PaymentMethod method, BigDecimal amount, Instant occurredAt) implements DomainEvent {
    @Override
    public String eventType() {
        return "PaymentConfirmed";
    }
}
