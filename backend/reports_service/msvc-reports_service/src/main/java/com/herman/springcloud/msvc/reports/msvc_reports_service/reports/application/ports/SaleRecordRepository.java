package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.SaleRecord;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SaleRecordRepository {
    SaleRecord save(SaleRecord saleRecord);
    Optional<SaleRecord> findByOrderId(UUID orderId);
    List<SaleRecord> findByRestaurantIdAndSoldAtBetween(UUID restaurantId, Instant from, Instant to);
    List<SaleRecord> findBySoldAtBetween(Instant from, Instant to);
}
