package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.confirm_payment;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports.DomainEventPublisher;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports.OrderRepository;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events.DomainEvent;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions.OrderNotFoundException;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConfirmOrderPaymentCommandHandler {
    private final OrderRepository orderRepository;
    private final DomainEventPublisher eventPublisher;

    public ConfirmOrderPaymentCommandHandler(OrderRepository orderRepository, DomainEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Order handle(ConfirmOrderPaymentCommand command) {
        Order order = orderRepository.findById(command.orderId())
                .orElseThrow(() -> new OrderNotFoundException("Pedido no encontrado"));
        order.confirmPayment();
        List<DomainEvent> events = order.pullDomainEvents();
        Order savedOrder = orderRepository.save(order);
        events.forEach(eventPublisher::publish);
        return savedOrder;
    }
}
