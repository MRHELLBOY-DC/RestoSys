package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.queries;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports.OrderRepository;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.Order;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ListActiveOrdersQueryHandler {
    private final OrderRepository orderRepository;

    public ListActiveOrdersQueryHandler(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> handle(UUID restaurantId) {
        return orderRepository.findByRestaurantIdAndStatusIn(
                restaurantId,
                List.of(OrderStatus.RECIBIDO, OrderStatus.PREPARANDO, OrderStatus.LISTO, OrderStatus.EN_CAMINO, OrderStatus.ENTREGADO)
        );
    }
}
