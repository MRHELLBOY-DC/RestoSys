package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events.DomainEvent;

public interface DomainEventPublisher {
    void publish(DomainEvent event);
}
