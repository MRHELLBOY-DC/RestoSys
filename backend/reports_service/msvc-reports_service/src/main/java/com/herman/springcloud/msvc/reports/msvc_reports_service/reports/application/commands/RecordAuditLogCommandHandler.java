package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports.AuditLogRepository;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports.DomainEventPublisher;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.events.DomainEvent;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.AuditLog;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RecordAuditLogCommandHandler {
    private final AuditLogRepository auditLogRepository;
    private final DomainEventPublisher eventPublisher;

    public RecordAuditLogCommandHandler(AuditLogRepository auditLogRepository, DomainEventPublisher eventPublisher) {
        this.auditLogRepository = auditLogRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public AuditLog handle(RecordAuditLogCommand command) {
        AuditLog auditLog = AuditLog.record(command.restaurantId(), command.source(), command.action(), command.detail(), command.occurredAt());
        List<DomainEvent> events = auditLog.pullDomainEvents();
        AuditLog savedAuditLog = auditLogRepository.save(auditLog);
        events.forEach(eventPublisher::publish);
        return savedAuditLog;
    }
}
