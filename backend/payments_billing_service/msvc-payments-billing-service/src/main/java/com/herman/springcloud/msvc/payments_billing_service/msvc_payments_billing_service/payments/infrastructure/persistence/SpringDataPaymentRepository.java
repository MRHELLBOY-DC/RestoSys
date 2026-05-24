package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringDataPaymentRepository extends JpaRepository<JpaPaymentEntity, UUID> {
    Optional<JpaPaymentEntity> findByOrderId(UUID orderId);
    List<JpaPaymentEntity> findByRestaurantIdOrderByCreatedAtDesc(UUID restaurantId);
}
