package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.exceptions.DomainException;

import java.math.BigDecimal;
import java.util.UUID;

public class SaleItem extends Entity {
    private final UUID productId;
    private final String productName;
    private final int quantity;
    private final BigDecimal unitPrice;

    private SaleItem(UUID id, UUID productId, String productName, int quantity, BigDecimal unitPrice) {
        super(id);
        if (productId == null) throw new DomainException("El producto es obligatorio");
        if (productName == null || productName.isBlank()) throw new DomainException("El nombre del producto es obligatorio");
        if (quantity <= 0) throw new DomainException("La cantidad debe ser mayor a cero");
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) < 0) throw new DomainException("El precio no puede ser negativo");
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public static SaleItem create(UUID productId, String productName, int quantity, BigDecimal unitPrice) {
        return new SaleItem(UUID.randomUUID(), productId, productName, quantity, unitPrice);
    }

    public static SaleItem restore(UUID id, UUID productId, String productName, int quantity, BigDecimal unitPrice) {
        return new SaleItem(id, productId, productName, quantity, unitPrice);
    }

    public BigDecimal subtotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public UUID getProductId() { return productId; }
    public String getProductName() { return productName; }
    public int getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
}
