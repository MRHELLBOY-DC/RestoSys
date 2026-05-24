package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.infrastructure.events;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SpringDataEventLogRepository extends JpaRepository<JpaEventLogEntity, UUID> {
}
