package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.events.DomainEvent;

public interface DomainEventPublisher {
    void publish(DomainEvent event);
}
