package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions.DomainException;

import java.math.BigDecimal;
import java.util.UUID;

public class OrderItemOption {
    private final UUID id;
    private final UUID optionId;
    private final String name;
    private final BigDecimal extraPrice;

    public OrderItemOption(UUID id, UUID optionId, String name, BigDecimal extraPrice) {
        if (optionId == null) {
            throw new DomainException("La opcion del producto es obligatoria");
        }
        if (name == null || name.isBlank()) {
            throw new DomainException("El nombre de la opcion es obligatorio");
        }
        if (extraPrice == null || extraPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new DomainException("El precio extra no puede ser negativo");
        }
        this.id = id == null ? UUID.randomUUID() : id;
        this.optionId = optionId;
        this.name = name;
        this.extraPrice = extraPrice;
    }

    public UUID getId() {
        return id;
    }

    public UUID getOptionId() {
        return optionId;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getExtraPrice() {
        return extraPrice;
    }
}
