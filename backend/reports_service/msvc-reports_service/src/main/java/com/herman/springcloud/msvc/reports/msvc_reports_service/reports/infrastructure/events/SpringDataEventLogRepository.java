package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.events;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SpringDataEventLogRepository extends JpaRepository<JpaEventLogEntity, UUID> {
}
