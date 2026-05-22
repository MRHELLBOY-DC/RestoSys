package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.queries;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports.OrderRepository;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions.OrderNotFoundException;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.Order;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class GetOrderQueryHandler {
    private final OrderRepository orderRepository;

    public GetOrderQueryHandler(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order handle(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Pedido no encontrado"));
    }

    public Order handleByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new OrderNotFoundException("Pedido no encontrado"));
    }
}
