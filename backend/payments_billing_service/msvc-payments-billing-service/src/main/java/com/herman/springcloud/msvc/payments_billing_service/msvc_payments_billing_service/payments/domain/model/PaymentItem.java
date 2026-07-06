package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentItem(UUID productId, String productName, int quantity, BigDecimal unitPrice) {
}
