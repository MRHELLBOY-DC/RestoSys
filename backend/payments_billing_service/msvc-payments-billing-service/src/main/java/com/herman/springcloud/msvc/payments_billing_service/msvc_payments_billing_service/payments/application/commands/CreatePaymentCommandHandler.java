package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.commands;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.ports.DomainEventPublisher;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.ports.PaymentRepository;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.events.DomainEvent;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Payment;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.PaymentItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CreatePaymentCommandHandler {
    private final PaymentRepository paymentRepository;
    private final DomainEventPublisher eventPublisher;

    public CreatePaymentCommandHandler(PaymentRepository paymentRepository, DomainEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Payment handle(CreatePaymentCommand command) {
        List<PaymentItem> items = command.items() == null ? List.of() : command.items().stream()
                .map(item -> new PaymentItem(item.productId(), item.productName(), item.quantity(), item.unitPrice()))
                .toList();
        Payment payment = Payment.createPending(command.orderId(), command.restaurantId(), command.clientId(), command.amount(), command.method(), items);
        List<DomainEvent> events = payment.pullDomainEvents();
        Payment savedPayment = paymentRepository.save(payment);
        events.forEach(eventPublisher::publish);
        return savedPayment;
    }
}
