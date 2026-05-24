package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SaleRecordedEvent(UUID aggregateId, UUID restaurantId, UUID orderId, BigDecimal totalAmount, Instant occurredAt) implements DomainEvent {
    @Override
    public String eventType() {
        return "SaleRecorded";
    }
}
