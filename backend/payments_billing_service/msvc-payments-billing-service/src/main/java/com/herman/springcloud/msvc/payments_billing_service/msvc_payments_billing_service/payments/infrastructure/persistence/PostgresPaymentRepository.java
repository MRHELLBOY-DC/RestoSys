package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.infrastructure.persistence;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.ports.PaymentRepository;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Payment;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@Transactional(readOnly = true)
public class PostgresPaymentRepository implements PaymentRepository {
    private final SpringDataPaymentRepository springDataPaymentRepository;
    private final PaymentMapper mapper = new PaymentMapper();

    public PostgresPaymentRepository(SpringDataPaymentRepository springDataPaymentRepository) {
        this.springDataPaymentRepository = springDataPaymentRepository;
    }

    @Override
    @Transactional
    public Payment save(Payment payment) {
        return mapper.toDomain(springDataPaymentRepository.save(mapper.toEntity(payment)));
    }

    @Override
    public Optional<Payment> findById(UUID id) {
        return springDataPaymentRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Payment> findByOrderId(UUID orderId) {
        return springDataPaymentRepository.findByOrderId(orderId).map(mapper::toDomain);
    }

    @Override
    public List<Payment> findByRestaurantId(UUID restaurantId) {
        return springDataPaymentRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId).stream().map(mapper::toDomain).toList();
    }
}
