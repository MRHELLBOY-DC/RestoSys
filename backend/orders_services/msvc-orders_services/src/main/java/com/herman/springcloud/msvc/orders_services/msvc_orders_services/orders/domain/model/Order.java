package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events.OrderCreatedEvent;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events.OrderPaidEvent;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.events.OrderStatusChangedEvent;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions.DomainException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class Order extends AggregateRoot {
    private final UUID restaurantId;
    private final UUID clientId;
    private final String orderCode;
    private final OrderType type;
    private final String tableNumber;
    private final List<OrderItem> items;
    private final Instant createdAt;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private Instant updatedAt;

    private Order(UUID id, UUID restaurantId, UUID clientId, String orderCode, OrderType type, String tableNumber, List<OrderItem> items,
                  OrderStatus status, PaymentStatus paymentStatus, Instant createdAt, Instant updatedAt) {
        super(id);
        if (restaurantId == null) {
            throw new DomainException("El restaurante es obligatorio");
        }
        if (orderCode == null || orderCode.isBlank()) {
            throw new DomainException("El codigo del pedido es obligatorio");
        }
        if (type == null) {
            throw new DomainException("El tipo de pedido es obligatorio");
        }
        if (type == OrderType.MESA && (tableNumber == null || tableNumber.isBlank())) {
            throw new DomainException("El numero de mesa es obligatorio para pedidos en mesa");
        }
        if (items == null || items.isEmpty()) {
            throw new DomainException("El pedido debe tener al menos un producto");
        }
        this.restaurantId = restaurantId;
        this.clientId = clientId;
        this.orderCode = orderCode;
        this.type = type;
        this.tableNumber = tableNumber;
        this.items = new ArrayList<>(items);
        this.status = status == null ? OrderStatus.RECIBIDO : status;
        this.paymentStatus = paymentStatus == null ? PaymentStatus.PENDIENTE : paymentStatus;
        this.createdAt = createdAt == null ? Instant.now() : createdAt;
        this.updatedAt = updatedAt == null ? this.createdAt : updatedAt;
    }

    public static Order create(UUID restaurantId, UUID clientId, OrderType type, String tableNumber, List<OrderItem> items) {
        Order order = new Order(UUID.randomUUID(), restaurantId, clientId, generateOrderCode(), type, tableNumber, items,
                OrderStatus.RECIBIDO, PaymentStatus.PENDIENTE, Instant.now(), Instant.now());
        order.addDomainEvent(new OrderCreatedEvent(order.getId(), order.restaurantId, order.orderCode, order.totalAmount(), Instant.now()));
        return order;
    }

    public static Order restore(UUID id, UUID restaurantId, UUID clientId, String orderCode, OrderType type, String tableNumber, List<OrderItem> items,
                                OrderStatus status, PaymentStatus paymentStatus, Instant createdAt, Instant updatedAt) {
        return new Order(id, restaurantId, clientId, orderCode, type, tableNumber, items, status, paymentStatus, createdAt, updatedAt);
    }

    public void changeStatus(OrderStatus newStatus) {
        if (newStatus == null) {
            throw new DomainException("El nuevo estado es obligatorio");
        }
        if (status == OrderStatus.CANCELADO || status == OrderStatus.ENTREGADO) {
            throw new DomainException("No se puede cambiar un pedido finalizado");
        }
        if (!isValidTransition(status, newStatus)) {
            throw new DomainException("Transicion de estado invalida: " + status + " -> " + newStatus);
        }
        OrderStatus previousStatus = status;
        status = newStatus;
        updatedAt = Instant.now();
        addDomainEvent(new OrderStatusChangedEvent(getId(), previousStatus, newStatus, updatedAt));
    }

    public void confirmPayment() {
        if (paymentStatus == PaymentStatus.PAGADO) {
            throw new DomainException("El pedido ya esta pagado");
        }
        paymentStatus = PaymentStatus.PAGADO;
        updatedAt = Instant.now();
        addDomainEvent(new OrderPaidEvent(getId(), updatedAt));
    }

    public BigDecimal totalAmount() {
        return items.stream()
                .map(OrderItem::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static boolean isValidTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        return switch (currentStatus) {
            case RECIBIDO -> newStatus == OrderStatus.PREPARANDO || newStatus == OrderStatus.CANCELADO;
            case PREPARANDO -> newStatus == OrderStatus.LISTO || newStatus == OrderStatus.CANCELADO;
            case LISTO -> newStatus == OrderStatus.ENTREGADO;
            case ENTREGADO, CANCELADO -> false;
        };
    }

    private static String generateOrderCode() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public UUID getClientId() {
        return clientId;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public OrderType getType() {
        return type;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    public OrderStatus getStatus() {
        return status;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
