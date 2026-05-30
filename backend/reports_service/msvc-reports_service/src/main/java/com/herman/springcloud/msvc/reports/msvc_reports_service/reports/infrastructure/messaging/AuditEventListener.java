package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.messaging;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands.RecordAuditLogCommand;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands.RecordAuditLogCommandHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class AuditEventListener {
    private static final Pattern RESTAURANT_ID_PATTERN = Pattern.compile("restaurantId=([0-9a-fA-F\\-]{36})");
    private static final Pattern RESTAURANT_ID_JSON_PATTERN = Pattern.compile("\\\"restaurant_id\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"");
    private final RecordAuditLogCommandHandler recordAuditLogHandler;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuditEventListener(RecordAuditLogCommandHandler recordAuditLogHandler) {
        this.recordAuditLogHandler = recordAuditLogHandler;
    }

    @RabbitListener(queues = "${reports.events.audit.queue:reports.audit-events}")
    public void handle(String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            String eventType = textValue(root, "event_type");
            Instant occurredAt = parseInstant(textValue(root, "timestamp"));
            UUID restaurantId = extractRestaurantId(root);
            String source = resolveSource(eventType);
            String action = eventType == null || eventType.isBlank() ? "EventReceived" : eventType;

            recordAuditLogHandler.handle(new RecordAuditLogCommand(
                    restaurantId,
                    source,
                    action,
                    payload,
                    occurredAt
            ));
        } catch (Exception ignored) {
            // Silently ignore malformed audit events
        }
    }

    private String textValue(JsonNode node, String field) {
        JsonNode value = node == null ? null : node.get(field);
        return value != null && value.isTextual() ? value.asText() : null;
    }

    private Instant parseInstant(String value) {
        if (value == null || value.isBlank()) {
            return Instant.now();
        }
        try {
            return Instant.parse(value);
        } catch (Exception ignored) {
            return Instant.now();
        }
    }

    private UUID extractRestaurantId(JsonNode root) {
        JsonNode dataNode = root == null ? null : root.get("data");
        UUID fromData = extractRestaurantIdFromDataNode(dataNode);
        if (fromData != null) {
            return fromData;
        }
        String dataText = dataNode != null && dataNode.isTextual() ? dataNode.asText() : null;
        return extractRestaurantIdFromText(dataText);
    }

    private UUID extractRestaurantIdFromDataNode(JsonNode dataNode) {
        if (dataNode == null || dataNode.isTextual()) {
            return null;
        }
        JsonNode restaurantId = dataNode.get("restaurant_id");
        if (restaurantId == null) {
            restaurantId = dataNode.get("restaurantId");
        }
        if (restaurantId != null) {
            if (restaurantId.isNumber()) {
                return numericIdToUuid(restaurantId.longValue());
            }
            if (restaurantId.isTextual()) {
                String text = restaurantId.asText();
                try {
                    return UUID.fromString(text);
                } catch (Exception ignored) {
                }
                try {
                    return numericIdToUuid(Long.parseLong(text));
                } catch (Exception ignored) {
                }
            }
        }
        return null;
    }

    private UUID numericIdToUuid(long id) {
        return UUID.fromString("00000000-0000-0000-0000-" + String.format("%012d", id));
    }

    private UUID extractRestaurantIdFromText(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        Matcher matcher = RESTAURANT_ID_PATTERN.matcher(text);
        if (matcher.find()) {
            try {
                return UUID.fromString(matcher.group(1));
            } catch (Exception ignored) {
                return null;
            }
        }
        Matcher jsonMatcher = RESTAURANT_ID_JSON_PATTERN.matcher(text);
        if (jsonMatcher.find()) {
            try {
                return UUID.fromString(jsonMatcher.group(1));
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }

    private String resolveSource(String eventType) {
        if (eventType == null) {
            return "system";
        }
        String normalized = eventType.toLowerCase(Locale.ROOT);
        if (normalized.startsWith("user") || normalized.startsWith("restaurant") || normalized.startsWith("auth.login")) {
            return "auth-service";
        }
        if (normalized.startsWith("category") || normalized.startsWith("product") || normalized.startsWith("option")) {
            return "menu-service";
        }
        if (normalized.startsWith("order")) {
            return "orders-service";
        }
        return "system";
    }
}
