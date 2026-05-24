package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.messaging;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.confirm_payment.ConfirmOrderPaymentCommand;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.confirm_payment.ConfirmOrderPaymentCommandHandler;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions.DomainException;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions.OrderNotFoundException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class PaymentConfirmedEventListener {
    private static final Pattern ORDER_ID_PATTERN = Pattern.compile("\"order_id\"\\s*:\\s*\"([^\"]+)\"");

    private final ConfirmOrderPaymentCommandHandler confirmOrderPaymentHandler;

    public PaymentConfirmedEventListener(ConfirmOrderPaymentCommandHandler confirmOrderPaymentHandler) {
        this.confirmOrderPaymentHandler = confirmOrderPaymentHandler;
    }

    @RabbitListener(queues = "${orders.events.payment-confirmed.queue:orders.payment-confirmed}")
    public void handle(String payload) {
        UUID orderId = extractOrderId(payload);
        if (orderId == null) {
            return;
        }
        try {
            confirmOrderPaymentHandler.handle(new ConfirmOrderPaymentCommand(orderId));
        } catch (OrderNotFoundException | DomainException ignored) {
        }
    }

    private UUID extractOrderId(String payload) {
        try {
            Matcher matcher = ORDER_ID_PATTERN.matcher(payload);
            if (!matcher.find()) {
                return null;
            }
            return UUID.fromString(matcher.group(1));
        } catch (Exception ignored) {
            return null;
        }
    }
}
