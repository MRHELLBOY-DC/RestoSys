package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.events.PaymentConfirmedEvent;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.events.PaymentCreatedEvent;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.events.ReceiptGeneratedEvent;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.exceptions.DomainException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class Payment extends AggregateRoot {
    private final UUID orderId;
    private final UUID restaurantId;
    private final UUID clientId;
    private final BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private String qrPayload;
    private Receipt receipt;
    private final Instant createdAt;
    private Instant paidAt;
    private final List<PaymentItem> items;

    private Payment(UUID id, UUID orderId, UUID restaurantId, UUID clientId, BigDecimal amount, PaymentMethod method, PaymentStatus status,
                    String qrPayload, Receipt receipt, Instant createdAt, Instant paidAt, List<PaymentItem> items) {
        super(id);
        if (orderId == null || restaurantId == null) throw new DomainException("Pago requiere pedido y restaurante");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) throw new DomainException("El monto debe ser mayor a cero");
        this.orderId = orderId;
        this.restaurantId = restaurantId;
        this.clientId = clientId;
        this.amount = amount;
        this.method = method;
        this.status = status == null ? PaymentStatus.PENDING : status;
        this.qrPayload = qrPayload;
        this.receipt = receipt;
        this.createdAt = createdAt == null ? Instant.now() : createdAt;
        this.paidAt = paidAt;
        this.items = new ArrayList<>(items == null ? List.of() : items);
    }

    public static Payment createPending(UUID orderId, UUID restaurantId, UUID clientId, BigDecimal amount, PaymentMethod method, List<PaymentItem> items) {
        Payment payment = new Payment(UUID.randomUUID(), orderId, restaurantId, clientId, amount, method, PaymentStatus.PENDING, null, null, Instant.now(), null, items);
        payment.addDomainEvent(new PaymentCreatedEvent(payment.getId(), orderId, restaurantId, amount, Instant.now()));
        if (method == PaymentMethod.QR_ONLINE) {
            payment.qrPayload = "RESTOSYS://pay/" + payment.getId();
        }
        return payment;
    }

    public static Payment restore(UUID id, UUID orderId, UUID restaurantId, UUID clientId, BigDecimal amount, PaymentMethod method, PaymentStatus status,
                                  String qrPayload, Receipt receipt, Instant createdAt, Instant paidAt, List<PaymentItem> items) {
        return new Payment(id, orderId, restaurantId, clientId, amount, method, status, qrPayload, receipt, createdAt, paidAt, items);
    }

    public Receipt confirm(ReceiptType receiptType) {
        if (status == PaymentStatus.PAID) throw new DomainException("El pago ya fue confirmado");
        if (status == PaymentStatus.CANCELLED) throw new DomainException("No se puede confirmar un pago cancelado");
        status = PaymentStatus.PAID;
        paidAt = Instant.now();
        receipt = Receipt.issue(getId(), orderId, restaurantId, receiptType, amount);
        addDomainEvent(new PaymentConfirmedEvent(getId(), orderId, restaurantId, clientId, method, amount, paidAt, items));
        addDomainEvent(new ReceiptGeneratedEvent(receipt.getId(), getId(), orderId, receipt.getReceiptNumber(), paidAt));
        return receipt;
    }

    public UUID getOrderId() { return orderId; }
    public UUID getRestaurantId() { return restaurantId; }
    public UUID getClientId() { return clientId; }
    public BigDecimal getAmount() { return amount; }
    public PaymentMethod getMethod() { return method; }
    public PaymentStatus getStatus() { return status; }
    public String getQrPayload() { return qrPayload; }
    public Receipt getReceipt() { return receipt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getPaidAt() { return paidAt; }
    public List<PaymentItem> getItems() { return Collections.unmodifiableList(items); }
}
