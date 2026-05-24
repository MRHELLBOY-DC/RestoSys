package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.AuditLog;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository {
    AuditLog save(AuditLog auditLog);
    List<AuditLog> findByRestaurantId(UUID restaurantId);
    List<AuditLog> findAll();
}
