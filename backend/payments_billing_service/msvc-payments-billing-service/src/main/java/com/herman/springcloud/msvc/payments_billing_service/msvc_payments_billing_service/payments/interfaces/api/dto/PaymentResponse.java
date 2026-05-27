package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.interfaces.api.dto;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(UUID id, UUID orderId, UUID restaurantId, UUID clientId, BigDecimal amount, PaymentMethod method,
                              PaymentStatus status, String qrPayload, Instant createdAt, Instant paidAt,
                              ReceiptResponse receipt) {
    public static PaymentResponse fromDomain(Payment payment) {
        return new PaymentResponse(payment.getId(), payment.getOrderId(), payment.getRestaurantId(), payment.getAmount(),
                payment.getMethod(), payment.getStatus(), payment.getQrPayload(), payment.getCreatedAt(), payment.getPaidAt(),
                payment.getReceipt() == null ? null : ReceiptResponse.fromDomain(payment.getReceipt()));
    }

    public record ReceiptResponse(UUID id, UUID paymentId, UUID orderId, UUID restaurantId, String receiptNumber,
                                  ReceiptType type, BigDecimal amount, String htmlContent, Instant issuedAt) {
        public static ReceiptResponse fromDomain(Receipt receipt) {
            return new ReceiptResponse(receipt.getId(), receipt.getPaymentId(), receipt.getOrderId(), receipt.getRestaurantId(),
                    receipt.getReceiptNumber(), receipt.getType(), receipt.getAmount(), receipt.getHtmlContent(), receipt.getIssuedAt());
        }
    }
}
