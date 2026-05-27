package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.infrastructure.persistence;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Payment;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Receipt;

public class PaymentMapper {
    public JpaPaymentEntity toEntity(Payment payment) {
        JpaPaymentEntity entity = new JpaPaymentEntity();
        entity.setId(payment.getId());
        entity.setOrderId(payment.getOrderId());
        entity.setRestaurantId(payment.getRestaurantId());
        entity.setClientId(payment.getClientId());
        entity.setAmount(payment.getAmount());
        entity.setMethod(payment.getMethod());
        entity.setStatus(payment.getStatus());
        entity.setQrPayload(payment.getQrPayload());
        entity.setCreatedAt(payment.getCreatedAt());
        entity.setPaidAt(payment.getPaidAt());
        if (payment.getReceipt() != null) {
            JpaReceiptEntity receiptEntity = toReceiptEntity(payment.getReceipt(), entity);
            entity.setReceipt(receiptEntity);
        }
        return entity;
    }

    public Payment toDomain(JpaPaymentEntity entity) {
        Receipt receipt = entity.getReceipt() == null ? null : toReceiptDomain(entity.getReceipt());
        return Payment.restore(entity.getId(), entity.getOrderId(), entity.getRestaurantId(), entity.getClientId(), entity.getAmount(),
                entity.getMethod(), entity.getStatus(), entity.getQrPayload(), receipt, entity.getCreatedAt(), entity.getPaidAt());
    }

    private JpaReceiptEntity toReceiptEntity(Receipt receipt, JpaPaymentEntity paymentEntity) {
        JpaReceiptEntity entity = new JpaReceiptEntity();
        entity.setId(receipt.getId());
        entity.setPayment(paymentEntity);
        entity.setOrderId(receipt.getOrderId());
        entity.setRestaurantId(receipt.getRestaurantId());
        entity.setReceiptNumber(receipt.getReceiptNumber());
        entity.setType(receipt.getType());
        entity.setAmount(receipt.getAmount());
        entity.setHtmlContent(receipt.getHtmlContent());
        entity.setIssuedAt(receipt.getIssuedAt());
        return entity;
    }

    private Receipt toReceiptDomain(JpaReceiptEntity entity) {
        return new Receipt(entity.getId(), entity.getPayment().getId(), entity.getOrderId(), entity.getRestaurantId(),
                entity.getReceiptNumber(), entity.getType(), entity.getAmount(), entity.getHtmlContent(), entity.getIssuedAt());
    }
}
