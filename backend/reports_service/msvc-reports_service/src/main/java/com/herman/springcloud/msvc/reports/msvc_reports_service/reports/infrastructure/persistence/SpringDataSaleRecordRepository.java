package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringDataSaleRecordRepository extends JpaRepository<JpaSaleRecordEntity, UUID> {
    Optional<JpaSaleRecordEntity> findByOrderId(UUID orderId);
    List<JpaSaleRecordEntity> findByRestaurantIdAndSoldAtBetween(UUID restaurantId, Instant from, Instant to);
    List<JpaSaleRecordEntity> findBySoldAtBetween(Instant from, Instant to);
}
