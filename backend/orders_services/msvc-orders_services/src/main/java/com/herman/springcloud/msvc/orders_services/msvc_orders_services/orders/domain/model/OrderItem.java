package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions.DomainException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class OrderItem extends Entity {
    private final UUID productId;
    private final String productName;
    private final int quantity;
    private final BigDecimal unitPrice;
    private final List<OrderItemOption> options;

    public OrderItem(UUID id, UUID productId, String productName, int quantity, BigDecimal unitPrice, List<OrderItemOption> options) {
        super(id);
        if (productId == null) {
            throw new DomainException("El producto es obligatorio");
        }
        if (productName == null || productName.isBlank()) {
            throw new DomainException("El nombre del producto es obligatorio");
        }
        if (quantity <= 0) {
            throw new DomainException("La cantidad debe ser mayor a cero");
        }
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new DomainException("El precio unitario debe ser mayor a cero");
        }
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.options = new ArrayList<>(options == null ? List.of() : options);
    }

    public BigDecimal subtotal() {
        BigDecimal optionsTotal = options.stream()
                .map(OrderItemOption::getExtraPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return unitPrice.add(optionsTotal).multiply(BigDecimal.valueOf(quantity));
    }

    public UUID getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public List<OrderItemOption> getOptions() {
        return Collections.unmodifiableList(options);
    }
}
