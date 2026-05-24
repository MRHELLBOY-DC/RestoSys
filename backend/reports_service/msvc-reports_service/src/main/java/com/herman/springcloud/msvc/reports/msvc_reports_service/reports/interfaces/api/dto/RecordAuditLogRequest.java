package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.interfaces.api.dto;

import java.time.Instant;
import java.util.UUID;

public record RecordAuditLogRequest(UUID restaurantId, String source, String action, String detail, Instant occurredAt) {
}
