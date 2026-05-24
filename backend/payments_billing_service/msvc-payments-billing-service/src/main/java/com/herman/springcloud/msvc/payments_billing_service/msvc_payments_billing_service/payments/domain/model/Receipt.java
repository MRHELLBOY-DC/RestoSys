package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.exceptions.DomainException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class Receipt extends Entity {
    private final UUID paymentId;
    private final UUID orderId;
    private final UUID restaurantId;
    private final String receiptNumber;
    private final ReceiptType type;
    private final BigDecimal amount;
    private final String htmlContent;
    private final Instant issuedAt;

    public Receipt(UUID id, UUID paymentId, UUID orderId, UUID restaurantId, String receiptNumber, ReceiptType type,
                   BigDecimal amount, String htmlContent, Instant issuedAt) {
        super(id);
        if (paymentId == null || orderId == null || restaurantId == null) throw new DomainException("El comprobante requiere pago, pedido y restaurante");
        if (receiptNumber == null || receiptNumber.isBlank()) throw new DomainException("El numero de comprobante es obligatorio");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) throw new DomainException("El monto del comprobante debe ser mayor a cero");
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.restaurantId = restaurantId;
        this.receiptNumber = receiptNumber;
        this.type = type == null ? ReceiptType.BOLETA : type;
        this.amount = amount;
        this.htmlContent = htmlContent;
        this.issuedAt = issuedAt == null ? Instant.now() : issuedAt;
    }

    public static Receipt issue(UUID paymentId, UUID orderId, UUID restaurantId, ReceiptType type, BigDecimal amount) {
        String number = "RCPT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String html = "<html><body><h1>Comprobante RestoSys</h1><p>Nro: " + number + "</p><p>Pedido: " + orderId + "</p><p>Total: " + amount + "</p></body></html>";
        return new Receipt(UUID.randomUUID(), paymentId, orderId, restaurantId, number, type, amount, html, Instant.now());
    }

    public UUID getPaymentId() { return paymentId; }
    public UUID getOrderId() { return orderId; }
    public UUID getRestaurantId() { return restaurantId; }
    public String getReceiptNumber() { return receiptNumber; }
    public ReceiptType getType() { return type; }
    public BigDecimal getAmount() { return amount; }
    public String getHtmlContent() { return htmlContent; }
    public Instant getIssuedAt() { return issuedAt; }
}
