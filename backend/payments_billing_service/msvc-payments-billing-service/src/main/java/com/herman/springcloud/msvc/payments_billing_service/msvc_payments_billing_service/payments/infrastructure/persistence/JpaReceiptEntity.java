package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.infrastructure.persistence;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.ReceiptType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "receipts")
public class JpaReceiptEntity {
    @Id
    private UUID id;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private JpaPaymentEntity payment;
    @Column(name = "order_id", nullable = false)
    private UUID orderId;
    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;
    @Column(name = "receipt_number", nullable = false, unique = true)
    private String receiptNumber;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReceiptType type;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    @Column(name = "html_content", columnDefinition = "TEXT", nullable = false)
    private String htmlContent;
    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public JpaPaymentEntity getPayment() { return payment; }
    public void setPayment(JpaPaymentEntity payment) { this.payment = payment; }
    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }
    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
    public ReceiptType getType() { return type; }
    public void setType(ReceiptType type) { this.type = type; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getHtmlContent() { return htmlContent; }
    public void setHtmlContent(String htmlContent) { this.htmlContent = htmlContent; }
    public Instant getIssuedAt() { return issuedAt; }
    public void setIssuedAt(Instant issuedAt) { this.issuedAt = issuedAt; }
}
