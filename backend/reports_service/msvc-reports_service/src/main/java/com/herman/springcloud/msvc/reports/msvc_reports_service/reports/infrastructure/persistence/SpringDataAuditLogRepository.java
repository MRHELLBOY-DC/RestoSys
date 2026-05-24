package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringDataAuditLogRepository extends JpaRepository<JpaAuditLogEntity, UUID> {
    List<JpaAuditLogEntity> findByRestaurantIdOrderByOccurredAtDesc(UUID restaurantId);
    List<JpaAuditLogEntity> findAllByOrderByOccurredAtDesc();
}
