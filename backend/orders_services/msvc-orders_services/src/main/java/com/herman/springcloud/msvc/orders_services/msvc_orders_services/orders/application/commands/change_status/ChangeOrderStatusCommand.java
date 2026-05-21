package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.change_status;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderStatus;

import java.util.UUID;

public record ChangeOrderStatusCommand(UUID orderId, OrderStatus status) {
}
