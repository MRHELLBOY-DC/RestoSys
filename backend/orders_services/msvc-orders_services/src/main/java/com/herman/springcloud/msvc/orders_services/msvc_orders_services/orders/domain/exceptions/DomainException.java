package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions;

public class DomainException extends RuntimeException {
    public DomainException(String message) {
        super(message);
    }
}
