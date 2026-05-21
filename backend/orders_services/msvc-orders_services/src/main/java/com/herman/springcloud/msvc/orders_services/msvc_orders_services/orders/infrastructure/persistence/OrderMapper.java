package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.persistence;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.Order;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderItem;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderItemOption;

import java.util.List;

public class OrderMapper {
    public JpaOrderEntity toEntity(Order order) {
        JpaOrderEntity entity = new JpaOrderEntity();
        entity.setId(order.getId());
        entity.setRestaurantId(order.getRestaurantId());
        entity.setOrderCode(order.getOrderCode());
        entity.setType(order.getType());
        entity.setTableNumber(order.getTableNumber());
        entity.setStatus(order.getStatus());
        entity.setPaymentStatus(order.getPaymentStatus());
        entity.setTotalAmount(order.totalAmount());
        entity.setCreatedAt(order.getCreatedAt());
        entity.setUpdatedAt(order.getUpdatedAt());

        List<JpaOrderItemEntity> items = order.getItems().stream()
                .map(item -> toItemEntity(item, entity))
                .toList();
        entity.getItems().clear();
        entity.getItems().addAll(items);
        return entity;
    }

    public Order toDomain(JpaOrderEntity entity) {
        List<OrderItem> items = entity.getItems().stream()
                .map(this::toItemDomain)
                .toList();
        return Order.restore(
                entity.getId(),
                entity.getRestaurantId(),
                entity.getOrderCode(),
                entity.getType(),
                entity.getTableNumber(),
                items,
                entity.getStatus(),
                entity.getPaymentStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private JpaOrderItemEntity toItemEntity(OrderItem item, JpaOrderEntity orderEntity) {
        JpaOrderItemEntity entity = new JpaOrderItemEntity();
        entity.setId(item.getId());
        entity.setOrder(orderEntity);
        entity.setProductId(item.getProductId());
        entity.setProductName(item.getProductName());
        entity.setQuantity(item.getQuantity());
        entity.setUnitPrice(item.getUnitPrice());
        entity.setSubtotal(item.subtotal());

        List<JpaOrderItemOptionEntity> options = item.getOptions().stream()
                .map(option -> toOptionEntity(option, entity))
                .toList();
        entity.getOptions().clear();
        entity.getOptions().addAll(options);
        return entity;
    }

    private OrderItem toItemDomain(JpaOrderItemEntity entity) {
        List<OrderItemOption> options = entity.getOptions().stream()
                .map(this::toOptionDomain)
                .toList();
        return new OrderItem(
                entity.getId(),
                entity.getProductId(),
                entity.getProductName(),
                entity.getQuantity(),
                entity.getUnitPrice(),
                options
        );
    }

    private JpaOrderItemOptionEntity toOptionEntity(OrderItemOption option, JpaOrderItemEntity itemEntity) {
        JpaOrderItemOptionEntity entity = new JpaOrderItemOptionEntity();
        entity.setId(option.getId());
        entity.setOrderItem(itemEntity);
        entity.setOptionId(option.getOptionId());
        entity.setName(option.getName());
        entity.setExtraPrice(option.getExtraPrice());
        return entity;
    }

    private OrderItemOption toOptionDomain(JpaOrderItemOptionEntity entity) {
        return new OrderItemOption(
                entity.getId(),
                entity.getOptionId(),
                entity.getName(),
                entity.getExtraPrice()
        );
    }
}
