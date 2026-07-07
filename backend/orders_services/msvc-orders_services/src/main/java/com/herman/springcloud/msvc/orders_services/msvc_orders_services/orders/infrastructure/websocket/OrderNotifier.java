package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.websocket;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.Order;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.interfaces.api.dto.OrderResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderNotifier {
    private final SimpMessagingTemplate messagingTemplate;

    public OrderNotifier(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyOrderUpdate(Order order) {
        messagingTemplate.convertAndSendToUser(
                order.getClientId().toString(),
                "/queue/orders",
                OrderResponse.fromDomain(order)
        );
    }

    public void notifyArrival(Order order) {
        messagingTemplate.convertAndSendToUser(
                order.getClientId().toString(),
                "/queue/notifications",
                new ArrivalNotification(order.getId().toString(), order.getOrderCode(), "Tu repartidor ha llegado a tu direccion")
        );
    }

    public record ArrivalNotification(String orderId, String orderCode, String message) {
    }
}
