package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.events;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SpringDataEventLogRepository extends JpaRepository<JpaEventLogEntity, UUID> {
}
