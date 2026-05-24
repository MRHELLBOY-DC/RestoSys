package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.events.AuditLogRecordedEvent;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.exceptions.DomainException;

import java.time.Instant;
import java.util.UUID;

public class AuditLog extends AggregateRoot {
    private final UUID restaurantId;
    private final String source;
    private final String action;
    private final String detail;
    private final Instant occurredAt;

    private AuditLog(UUID id, UUID restaurantId, String source, String action, String detail, Instant occurredAt) {
        super(id);
        if (source == null || source.isBlank()) throw new DomainException("El origen del log es obligatorio");
        if (action == null || action.isBlank()) throw new DomainException("La accion del log es obligatoria");
        this.restaurantId = restaurantId;
        this.source = source;
        this.action = action;
        this.detail = detail == null ? "" : detail;
        this.occurredAt = occurredAt == null ? Instant.now() : occurredAt;
    }

    public static AuditLog record(UUID restaurantId, String source, String action, String detail, Instant occurredAt) {
        AuditLog auditLog = new AuditLog(UUID.randomUUID(), restaurantId, source, action, detail, occurredAt);
        auditLog.addDomainEvent(new AuditLogRecordedEvent(auditLog.getId(), action, auditLog.occurredAt));
        return auditLog;
    }

    public static AuditLog restore(UUID id, UUID restaurantId, String source, String action, String detail, Instant occurredAt) {
        return new AuditLog(id, restaurantId, source, action, detail, occurredAt);
    }

    public UUID getRestaurantId() { return restaurantId; }
    public String getSource() { return source; }
    public String getAction() { return action; }
    public String getDetail() { return detail; }
    public Instant getOccurredAt() { return occurredAt; }
}
