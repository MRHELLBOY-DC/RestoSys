package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.commands;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.ports.DomainEventPublisher;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.ports.PaymentRepository;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.events.DomainEvent;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.exceptions.PaymentNotFoundException;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Payment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConfirmPaymentCommandHandler {
    private final PaymentRepository paymentRepository;
    private final DomainEventPublisher eventPublisher;

    public ConfirmPaymentCommandHandler(PaymentRepository paymentRepository, DomainEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Payment handle(ConfirmPaymentCommand command) {
        Payment payment = paymentRepository.findById(command.paymentId())
                .orElseThrow(() -> new PaymentNotFoundException("Pago no encontrado"));
        payment.confirm(command.receiptType());
        List<DomainEvent> events = payment.pullDomainEvents();
        Payment savedPayment = paymentRepository.save(payment);
        events.forEach(eventPublisher::publish);
        return savedPayment;
    }
}
