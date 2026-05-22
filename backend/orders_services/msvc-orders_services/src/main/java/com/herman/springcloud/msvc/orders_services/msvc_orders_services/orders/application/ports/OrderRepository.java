package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.Order;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository {
    Order save(Order order);

    Optional<Order> findById(UUID id);

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByRestaurantIdAndStatusIn(UUID restaurantId, List<OrderStatus> statuses);

    List<Order> findByRestaurantId(UUID restaurantId);
}
