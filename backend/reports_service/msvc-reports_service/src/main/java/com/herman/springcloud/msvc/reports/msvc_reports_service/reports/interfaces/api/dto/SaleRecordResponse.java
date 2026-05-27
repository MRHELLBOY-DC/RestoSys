package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.interfaces.api.dto;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.SaleItem;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.SaleRecord;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SaleRecordResponse(UUID id, UUID restaurantId, UUID orderId, UUID paymentId, UUID clientId, BigDecimal totalAmount, Instant soldAt, List<SaleItemResponse> items) {
    public static SaleRecordResponse fromDomain(SaleRecord saleRecord) {
        return new SaleRecordResponse(
                saleRecord.getId(),
                saleRecord.getRestaurantId(),
                saleRecord.getOrderId(),
                saleRecord.getPaymentId(),
                saleRecord.getClientId(),
                saleRecord.getTotalAmount(),
                saleRecord.getSoldAt(),
                saleRecord.getItems().stream().map(SaleItemResponse::fromDomain).toList()
        );
    }

    public record SaleItemResponse(UUID id, UUID productId, String productName, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        public static SaleItemResponse fromDomain(SaleItem item) {
            return new SaleItemResponse(item.getId(), item.getProductId(), item.getProductName(), item.getQuantity(), item.getUnitPrice(), item.subtotal());
        }
    }
}
