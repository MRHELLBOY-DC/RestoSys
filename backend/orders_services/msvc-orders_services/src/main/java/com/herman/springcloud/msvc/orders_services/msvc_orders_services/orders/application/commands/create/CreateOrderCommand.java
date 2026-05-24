package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.create;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderType;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateOrderCommand(
        UUID restaurantId,
        UUID clientId,
        OrderType type,
        String tableNumber,
        List<CreateOrderItemCommand> items
) {
    public record CreateOrderItemCommand(
            UUID productId,
            String productName,
            int quantity,
            BigDecimal unitPrice,
            List<CreateOrderItemOptionCommand> options
    ) {
    }

    public record CreateOrderItemOptionCommand(
            UUID optionId,
            String name,
            BigDecimal extraPrice
    ) {
    }
}
