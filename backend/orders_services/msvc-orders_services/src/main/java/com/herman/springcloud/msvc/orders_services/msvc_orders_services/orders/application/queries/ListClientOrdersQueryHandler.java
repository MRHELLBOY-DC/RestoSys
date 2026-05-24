package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.queries;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports.OrderRepository;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.Order;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ListClientOrdersQueryHandler {
    private final OrderRepository orderRepository;

    public ListClientOrdersQueryHandler(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> handle(UUID clientId) {
        return orderRepository.findByClientId(clientId);
    }
}
