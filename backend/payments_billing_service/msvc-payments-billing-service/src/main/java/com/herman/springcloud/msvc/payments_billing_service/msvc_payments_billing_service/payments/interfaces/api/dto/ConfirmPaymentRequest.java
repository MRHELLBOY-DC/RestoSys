package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.interfaces.api.dto;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.ReceiptType;

public record ConfirmPaymentRequest(ReceiptType receiptType) {
}
