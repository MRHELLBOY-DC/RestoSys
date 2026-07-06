package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.commands;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.PaymentMethod;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreatePaymentCommand(UUID orderId, UUID restaurantId, UUID clientId, BigDecimal amount, PaymentMethod method, List<CreatePaymentItemCommand> items) {
    public record CreatePaymentItemCommand(UUID productId, String productName, int quantity, BigDecimal unitPrice) {
    }
}
