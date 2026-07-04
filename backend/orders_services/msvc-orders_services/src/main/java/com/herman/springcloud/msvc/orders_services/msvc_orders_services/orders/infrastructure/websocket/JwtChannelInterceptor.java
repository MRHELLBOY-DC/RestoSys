package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.websocket;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.security.JwtTokenValidator;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {
    private final JwtTokenValidator tokenValidator;

    public JwtChannelInterceptor(JwtTokenValidator tokenValidator) {
        this.tokenValidator = tokenValidator;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractToken(accessor.getNativeHeader("Authorization"));
            if (token == null) {
                throw new IllegalArgumentException("Token requerido para conectar por WebSocket");
            }
            JwtTokenValidator.AuthenticatedUser user = tokenValidator.validate(token)
                    .orElseThrow(() -> new IllegalArgumentException("Token invalido o expirado"));
            UUID clientId = numericIdToUuid(user.id());
            accessor.setUser(new StompUserPrincipal(clientId));
        }
        return message;
    }

    private String extractToken(List<String> authHeaders) {
        if (authHeaders == null || authHeaders.isEmpty()) {
            return null;
        }
        String header = authHeaders.get(0);
        return header.startsWith("Bearer ") ? header.substring(7) : header;
    }

    private UUID numericIdToUuid(Long id) {
        return UUID.fromString("00000000-0000-0000-0000-" + String.format("%012d", id));
    }
}
