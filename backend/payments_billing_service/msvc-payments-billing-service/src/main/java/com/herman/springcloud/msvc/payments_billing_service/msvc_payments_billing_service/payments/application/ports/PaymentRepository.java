package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.ports;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Payment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository {
    Payment save(Payment payment);
    Optional<Payment> findById(UUID id);
    Optional<Payment> findByOrderId(UUID orderId);
    List<Payment> findByRestaurantId(UUID restaurantId);
}
