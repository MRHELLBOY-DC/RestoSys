package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.interfaces.api.dto;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.PaymentMethod;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreatePaymentRequest(UUID orderId, UUID restaurantId, UUID clientId, BigDecimal amount, PaymentMethod method, List<CreatePaymentItemRequest> items) {
    public record CreatePaymentItemRequest(UUID productId, String productName, int quantity, BigDecimal unitPrice) {
    }
}
