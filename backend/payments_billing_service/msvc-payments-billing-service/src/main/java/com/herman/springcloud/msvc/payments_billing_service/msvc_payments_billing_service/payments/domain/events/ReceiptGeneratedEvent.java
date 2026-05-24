package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.events;

import java.time.Instant;
import java.util.UUID;

public record ReceiptGeneratedEvent(UUID aggregateId, UUID paymentId, UUID orderId, String receiptNumber, Instant occurredAt) implements DomainEvent {
    @Override
    public String eventType() {
        return "ReceiptGenerated";
    }
}
