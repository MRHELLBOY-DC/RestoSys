package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model;

import java.util.Objects;
import java.util.UUID;

public abstract class Entity {
    private final UUID id;

    protected Entity(UUID id) {
        this.id = id == null ? UUID.randomUUID() : id;
    }

    public UUID getId() {
        return id;
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;
        if (object == null || getClass() != object.getClass()) return false;
        Entity entity = (Entity) object;
        return Objects.equals(id, entity.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
