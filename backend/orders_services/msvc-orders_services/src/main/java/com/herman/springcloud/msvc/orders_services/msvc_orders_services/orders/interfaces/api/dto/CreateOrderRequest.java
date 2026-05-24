package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.interfaces.api.dto;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderType;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(
        UUID restaurantId,
        UUID clientId,
        OrderType type,
        String tableNumber,
        List<CreateOrderItemRequest> items
) {
    public record CreateOrderItemRequest(
            UUID productId,
            String productName,
            int quantity,
            BigDecimal unitPrice,
            List<CreateOrderItemOptionRequest> options
    ) {
    }

    public record CreateOrderItemOptionRequest(
            UUID optionId,
            String name,
            BigDecimal extraPrice
    ) {
    }
}
