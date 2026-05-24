package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.events;

import java.time.Instant;
import java.util.UUID;

public interface DomainEvent {
    UUID aggregateId();
    String eventType();
    Instant occurredAt();
}
