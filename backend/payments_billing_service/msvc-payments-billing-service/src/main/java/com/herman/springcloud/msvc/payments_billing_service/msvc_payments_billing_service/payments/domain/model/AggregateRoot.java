package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.events.DomainEvent;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public abstract class AggregateRoot extends Entity {
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    protected AggregateRoot(UUID id) {
        super(id);
    }

    protected void addDomainEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }

    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = List.copyOf(domainEvents);
        clearDomainEvents();
        return events;
    }

    public void clearDomainEvents() {
        domainEvents.clear();
    }
}
