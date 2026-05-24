package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.events.SaleRecordedEvent;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.exceptions.DomainException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class SaleRecord extends AggregateRoot {
    private final UUID restaurantId;
    private final UUID orderId;
    private final UUID paymentId;
    private final BigDecimal totalAmount;
    private final Instant soldAt;
    private final List<SaleItem> items;

    private SaleRecord(UUID id, UUID restaurantId, UUID orderId, UUID paymentId, BigDecimal totalAmount, Instant soldAt, List<SaleItem> items) {
        super(id);
        if (restaurantId == null) throw new DomainException("El restaurante es obligatorio");
        if (orderId == null) throw new DomainException("El pedido es obligatorio");
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) < 0) throw new DomainException("El total no puede ser negativo");
        this.restaurantId = restaurantId;
        this.orderId = orderId;
        this.paymentId = paymentId;
        this.totalAmount = totalAmount;
        this.soldAt = soldAt == null ? Instant.now() : soldAt;
        this.items = new ArrayList<>(items == null ? List.of() : items);
    }

    public static SaleRecord create(UUID restaurantId, UUID orderId, UUID paymentId, BigDecimal totalAmount, Instant soldAt, List<SaleItem> items) {
        SaleRecord saleRecord = new SaleRecord(UUID.randomUUID(), restaurantId, orderId, paymentId, totalAmount, soldAt, items);
        saleRecord.addDomainEvent(new SaleRecordedEvent(saleRecord.getId(), restaurantId, orderId, totalAmount, saleRecord.soldAt));
        return saleRecord;
    }

    public static SaleRecord restore(UUID id, UUID restaurantId, UUID orderId, UUID paymentId, BigDecimal totalAmount, Instant soldAt, List<SaleItem> items) {
        return new SaleRecord(id, restaurantId, orderId, paymentId, totalAmount, soldAt, items);
    }

    public UUID getRestaurantId() { return restaurantId; }
    public UUID getOrderId() { return orderId; }
    public UUID getPaymentId() { return paymentId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public Instant getSoldAt() { return soldAt; }
    public List<SaleItem> getItems() { return Collections.unmodifiableList(items); }
}
