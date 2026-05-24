package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.interfaces.api.dto;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.AuditLog;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(UUID id, UUID restaurantId, String source, String action, String detail, Instant occurredAt) {
    public static AuditLogResponse fromDomain(AuditLog auditLog) {
        return new AuditLogResponse(auditLog.getId(), auditLog.getRestaurantId(), auditLog.getSource(), auditLog.getAction(), auditLog.getDetail(), auditLog.getOccurredAt());
    }
}
