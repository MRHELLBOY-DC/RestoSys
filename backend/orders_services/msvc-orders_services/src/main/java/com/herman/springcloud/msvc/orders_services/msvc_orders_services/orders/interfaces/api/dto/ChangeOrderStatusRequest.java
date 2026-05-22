package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.interfaces.api.dto;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderStatus;

public record ChangeOrderStatusRequest(OrderStatus status) {
}
