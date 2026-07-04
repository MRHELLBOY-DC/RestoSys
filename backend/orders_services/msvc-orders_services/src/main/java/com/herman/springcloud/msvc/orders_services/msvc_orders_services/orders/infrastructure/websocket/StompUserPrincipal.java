package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.websocket;

import java.security.Principal;
import java.util.UUID;

public record StompUserPrincipal(UUID clientId) implements Principal {
    @Override
    public String getName() {
        return clientId.toString();
    }
}
