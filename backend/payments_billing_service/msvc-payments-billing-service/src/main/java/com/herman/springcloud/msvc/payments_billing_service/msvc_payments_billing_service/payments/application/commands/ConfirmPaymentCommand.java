package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.commands;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.ReceiptType;

import java.util.UUID;

public record ConfirmPaymentCommand(UUID paymentId, ReceiptType receiptType) {
}
