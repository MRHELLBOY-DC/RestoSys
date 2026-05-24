package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.exceptions;

public class PaymentNotFoundException extends RuntimeException {
    public PaymentNotFoundException(String message) {
        super(message);
    }
}
