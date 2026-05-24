package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.queries;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.ports.PaymentRepository;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Payment;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ListPaymentsQueryHandler {
    private final PaymentRepository paymentRepository;

    public ListPaymentsQueryHandler(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<Payment> handle(UUID restaurantId) {
        return paymentRepository.findByRestaurantId(restaurantId);
    }
}
