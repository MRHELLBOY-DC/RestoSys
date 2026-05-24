package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.events;

import java.time.Instant;
import java.util.UUID;

public record AuditLogRecordedEvent(UUID aggregateId, String action, Instant occurredAt) implements DomainEvent {
    @Override
    public String eventType() {
        return "AuditLogRecorded";
    }
}
