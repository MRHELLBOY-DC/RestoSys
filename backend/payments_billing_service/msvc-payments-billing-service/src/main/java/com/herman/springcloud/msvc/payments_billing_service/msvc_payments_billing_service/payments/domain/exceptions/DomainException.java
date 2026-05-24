package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.exceptions;

public class DomainException extends RuntimeException {
    public DomainException(String message) {
        super(message);
    }
}
