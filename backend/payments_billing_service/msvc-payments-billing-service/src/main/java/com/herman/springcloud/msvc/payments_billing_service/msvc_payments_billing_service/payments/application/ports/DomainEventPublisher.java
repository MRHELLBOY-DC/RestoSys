package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.ports;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.events.DomainEvent;

public interface DomainEventPublisher {
    void publish(DomainEvent event);
}
