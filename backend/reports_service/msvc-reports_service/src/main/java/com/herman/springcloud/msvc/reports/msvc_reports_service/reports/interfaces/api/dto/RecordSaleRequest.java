package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.interfaces.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RecordSaleRequest(UUID restaurantId, UUID orderId, UUID paymentId, UUID clientId, BigDecimal totalAmount, Instant soldAt, List<RecordSaleItemRequest> items) {
    public record RecordSaleItemRequest(UUID productId, String productName, int quantity, BigDecimal unitPrice) {
    }
}
