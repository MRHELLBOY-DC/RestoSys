package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.interfaces.api.dto;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.Order;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderItem;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderItemOption;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderStatus;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderType;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        UUID restaurantId,
        String orderCode,
        OrderType type,
        String tableNumber,
        OrderStatus status,
        PaymentStatus paymentStatus,
        BigDecimal totalAmount,
        Instant createdAt,
        Instant updatedAt,
        List<OrderItemResponse> items
) {
    public static OrderResponse fromDomain(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getRestaurantId(),
                order.getOrderCode(),
                order.getType(),
                order.getTableNumber(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.totalAmount(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getItems().stream().map(OrderItemResponse::fromDomain).toList()
        );
    }

    public record OrderItemResponse(
            UUID id,
            UUID productId,
            String productName,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal,
            List<OrderItemOptionResponse> options
    ) {
        public static OrderItemResponse fromDomain(OrderItem item) {
            return new OrderItemResponse(
                    item.getId(),
                    item.getProductId(),
                    item.getProductName(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.subtotal(),
                    item.getOptions().stream().map(OrderItemOptionResponse::fromDomain).toList()
            );
        }
    }

    public record OrderItemOptionResponse(
            UUID id,
            UUID optionId,
            String name,
            BigDecimal extraPrice
    ) {
        public static OrderItemOptionResponse fromDomain(OrderItemOption option) {
            return new OrderItemOptionResponse(option.getId(), option.getOptionId(), option.getName(), option.getExtraPrice());
        }
    }
}
