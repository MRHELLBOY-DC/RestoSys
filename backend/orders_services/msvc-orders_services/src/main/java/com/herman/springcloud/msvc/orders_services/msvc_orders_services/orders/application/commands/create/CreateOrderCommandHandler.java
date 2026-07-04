package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.create;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports.DomainEventPublisher;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports.OrderRepository;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events.DomainEvent;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.Order;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderItem;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderItemOption;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.websocket.OrderNotifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CreateOrderCommandHandler {
    private final OrderRepository orderRepository;
    private final DomainEventPublisher eventPublisher;
    private final OrderNotifier orderNotifier;

    public CreateOrderCommandHandler(OrderRepository orderRepository, DomainEventPublisher eventPublisher, OrderNotifier orderNotifier) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
        this.orderNotifier = orderNotifier;
    }

    @Transactional
    public Order handle(CreateOrderCommand command) {
        List<OrderItem> items = command.items().stream()
                .map(item -> new OrderItem(
                        null,
                        item.productId(),
                        item.productName(),
                        item.quantity(),
                        item.unitPrice(),
                        mapOptions(item.options())
                ))
                .toList();

        Order order = Order.create(command.restaurantId(), command.clientId(), command.type(), command.tableNumber(), items);
        List<DomainEvent> events = order.pullDomainEvents();
        Order savedOrder = orderRepository.save(order);
        events.forEach(eventPublisher::publish);
        orderNotifier.notifyOrderUpdate(savedOrder);
        return savedOrder;
    }

    private List<OrderItemOption> mapOptions(List<CreateOrderCommand.CreateOrderItemOptionCommand> options) {
        if (options == null) {
            return List.of();
        }
        return options.stream()
                .map(option -> new OrderItemOption(null, option.optionId(), option.name(), option.extraPrice()))
                .toList();
    }
}
