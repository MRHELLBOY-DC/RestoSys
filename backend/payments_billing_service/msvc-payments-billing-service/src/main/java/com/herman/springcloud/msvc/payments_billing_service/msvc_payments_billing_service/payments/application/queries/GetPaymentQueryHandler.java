package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.queries;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.ports.PaymentRepository;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.exceptions.PaymentNotFoundException;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Payment;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class GetPaymentQueryHandler {
    private final PaymentRepository paymentRepository;

    public GetPaymentQueryHandler(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Payment handle(UUID paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Pago no encontrado"));
    }

    public Payment handleByOrder(UUID orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException("Pago no encontrado"));
    }
}
