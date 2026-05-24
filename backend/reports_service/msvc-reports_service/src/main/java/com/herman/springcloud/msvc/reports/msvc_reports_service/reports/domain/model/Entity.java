package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model;

import java.util.UUID;

public abstract class Entity {
    private final UUID id;

    protected Entity(UUID id) {
        this.id = id == null ? UUID.randomUUID() : id;
    }

    public UUID getId() {
        return id;
    }
}
