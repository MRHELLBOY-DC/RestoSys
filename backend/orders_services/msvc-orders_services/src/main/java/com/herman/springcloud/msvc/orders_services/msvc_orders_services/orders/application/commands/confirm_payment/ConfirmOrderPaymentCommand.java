package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.confirm_payment;

import java.util.UUID;

public record ConfirmOrderPaymentCommand(UUID orderId) {
}
