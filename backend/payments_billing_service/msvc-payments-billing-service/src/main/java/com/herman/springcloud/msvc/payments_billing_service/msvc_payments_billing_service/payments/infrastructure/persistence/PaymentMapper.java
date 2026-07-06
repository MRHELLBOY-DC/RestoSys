package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.infrastructure.persistence;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Payment;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.PaymentItem;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Receipt;

import java.util.List;
import java.util.UUID;

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
        entity.setItems(payment.getItems().stream().map(item -> toItemEntity(item, entity)).toList());
        return entity;
    }

    public Payment toDomain(JpaPaymentEntity entity) {
        Receipt receipt = entity.getReceipt() == null ? null : toReceiptDomain(entity.getReceipt());
        List<PaymentItem> items = entity.getItems().stream()
                .map(item -> new PaymentItem(item.getProductId(), item.getProductName(), item.getQuantity(), item.getUnitPrice()))
                .toList();
        return Payment.restore(entity.getId(), entity.getOrderId(), entity.getRestaurantId(), entity.getClientId(), entity.getAmount(),
                entity.getMethod(), entity.getStatus(), entity.getQrPayload(), receipt, entity.getCreatedAt(), entity.getPaidAt(), items);
    }

    private JpaPaymentItemEntity toItemEntity(PaymentItem item, JpaPaymentEntity paymentEntity) {
        JpaPaymentItemEntity entity = new JpaPaymentItemEntity();
        entity.setId(UUID.randomUUID());
        entity.setPayment(paymentEntity);
        entity.setProductId(item.productId());
        entity.setProductName(item.productName());
        entity.setQuantity(item.quantity());
        entity.setUnitPrice(item.unitPrice());
        return entity;
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
