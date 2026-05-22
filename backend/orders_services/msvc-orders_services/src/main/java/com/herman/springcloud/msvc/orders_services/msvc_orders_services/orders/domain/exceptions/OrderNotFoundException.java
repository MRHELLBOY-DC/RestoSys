package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions;

public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(String message) {
        super(message);
    }
}
