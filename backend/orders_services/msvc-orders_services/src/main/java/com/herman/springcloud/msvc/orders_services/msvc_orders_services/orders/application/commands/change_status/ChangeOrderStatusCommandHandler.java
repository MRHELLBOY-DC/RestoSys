package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.change_status;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports.DomainEventPublisher;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports.OrderRepository;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events.DomainEvent;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions.OrderNotFoundException;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.Order;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.websocket.OrderNotifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChangeOrderStatusCommandHandler {
    private final OrderRepository orderRepository;
    private final DomainEventPublisher eventPublisher;
    private final OrderNotifier orderNotifier;

    public ChangeOrderStatusCommandHandler(OrderRepository orderRepository, DomainEventPublisher eventPublisher, OrderNotifier orderNotifier) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
        this.orderNotifier = orderNotifier;
    }

    @Transactional
    public Order handle(ChangeOrderStatusCommand command) {
        Order order = orderRepository.findById(command.orderId())
                .orElseThrow(() -> new OrderNotFoundException("Pedido no encontrado"));
        order.changeStatus(command.status());
        List<DomainEvent> events = order.pullDomainEvents();
        Order savedOrder = orderRepository.save(order);
        events.forEach(eventPublisher::publish);
        orderNotifier.notifyOrderUpdate(savedOrder);
        return savedOrder;
    }
}
