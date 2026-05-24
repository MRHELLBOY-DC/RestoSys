package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands;

import java.time.Instant;
import java.util.UUID;

public record RecordAuditLogCommand(UUID restaurantId, String source, String action, String detail, Instant occurredAt) {
}
