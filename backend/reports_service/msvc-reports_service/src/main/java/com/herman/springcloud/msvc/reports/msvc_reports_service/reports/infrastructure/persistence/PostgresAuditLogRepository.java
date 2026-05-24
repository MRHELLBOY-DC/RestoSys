package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.persistence;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports.AuditLogRepository;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.AuditLog;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class PostgresAuditLogRepository implements AuditLogRepository {
    private final SpringDataAuditLogRepository repository;

    public PostgresAuditLogRepository(SpringDataAuditLogRepository repository) {
        this.repository = repository;
    }

    @Override
    public AuditLog save(AuditLog auditLog) {
        return ReportMapper.toDomain(repository.save(ReportMapper.toJpa(auditLog)));
    }

    @Override
    public List<AuditLog> findByRestaurantId(UUID restaurantId) {
        return repository.findByRestaurantIdOrderByOccurredAtDesc(restaurantId).stream().map(ReportMapper::toDomain).toList();
    }

    @Override
    public List<AuditLog> findAll() {
        return repository.findAllByOrderByOccurredAtDesc().stream().map(ReportMapper::toDomain).toList();
    }
}
