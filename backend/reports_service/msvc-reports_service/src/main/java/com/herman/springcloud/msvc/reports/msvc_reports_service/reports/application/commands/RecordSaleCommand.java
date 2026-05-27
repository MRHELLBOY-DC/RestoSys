package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RecordSaleCommand(UUID restaurantId, UUID orderId, UUID paymentId, UUID clientId, BigDecimal totalAmount, Instant soldAt, List<RecordSaleItemCommand> items) {
    public record RecordSaleItemCommand(UUID productId, String productName, int quantity, BigDecimal unitPrice) {
    }
}
