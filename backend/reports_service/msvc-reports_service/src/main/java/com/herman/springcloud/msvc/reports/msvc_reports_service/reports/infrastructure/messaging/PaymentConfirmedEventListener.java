package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.messaging;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands.RecordAuditLogCommand;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands.RecordAuditLogCommandHandler;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands.RecordSaleCommand;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands.RecordSaleCommandHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class PaymentConfirmedEventListener {
    private static final Pattern PAYMENT_ID_PATTERN = Pattern.compile("\"aggregate_id\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern ORDER_ID_PATTERN = Pattern.compile("\"order_id\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern RESTAURANT_ID_PATTERN = Pattern.compile("\"restaurant_id\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern CLIENT_ID_PATTERN = Pattern.compile("\"client_id\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern AMOUNT_PATTERN = Pattern.compile("\"amount\"\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)");
    private static final Pattern TIMESTAMP_PATTERN = Pattern.compile("\"timestamp\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern ITEMS_ARRAY_PATTERN = Pattern.compile("\"items\"\\s*:\\s*\\[(.*?)]", Pattern.DOTALL);
    private static final Pattern ITEM_OBJECT_PATTERN = Pattern.compile("\\{[^{}]*}");
    private static final Pattern ITEM_PRODUCT_ID_PATTERN = Pattern.compile("\"product_id\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern ITEM_PRODUCT_NAME_PATTERN = Pattern.compile("\"product_name\"\\s*:\\s*\"([^\"]*)\"");
    private static final Pattern ITEM_QUANTITY_PATTERN = Pattern.compile("\"quantity\"\\s*:\\s*([0-9]+)");
    private static final Pattern ITEM_UNIT_PRICE_PATTERN = Pattern.compile("\"unit_price\"\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)");

    private final RecordSaleCommandHandler recordSaleHandler;
    private final RecordAuditLogCommandHandler recordAuditLogHandler;

    public PaymentConfirmedEventListener(RecordSaleCommandHandler recordSaleHandler, RecordAuditLogCommandHandler recordAuditLogHandler) {
        this.recordSaleHandler = recordSaleHandler;
        this.recordAuditLogHandler = recordAuditLogHandler;
    }

    @RabbitListener(queues = "${reports.events.payment-confirmed.queue:reports.payment-confirmed}")
    public void handle(String payload) {
        UUID paymentId = extractUuid(PAYMENT_ID_PATTERN, payload);
        UUID orderId = extractUuid(ORDER_ID_PATTERN, payload);
        UUID restaurantId = extractUuid(RESTAURANT_ID_PATTERN, payload);
        UUID clientId = extractUuid(CLIENT_ID_PATTERN, payload);
        BigDecimal amount = extractAmount(payload);
        Instant occurredAt = extractInstant(payload);
        if (orderId == null || restaurantId == null || amount == null) {
            return;
        }
        List<RecordSaleCommand.RecordSaleItemCommand> items = extractItems(payload);
        recordSaleHandler.handle(new RecordSaleCommand(restaurantId, orderId, paymentId, clientId, amount, occurredAt, items));
        recordAuditLogHandler.handle(new RecordAuditLogCommand(restaurantId, "payments-billing", "PAYMENT_CONFIRMED", payload, occurredAt));
    }

    private List<RecordSaleCommand.RecordSaleItemCommand> extractItems(String payload) {
        Matcher arrayMatcher = ITEMS_ARRAY_PATTERN.matcher(payload);
        if (!arrayMatcher.find()) {
            return List.of();
        }
        String itemsArray = arrayMatcher.group(1);
        List<RecordSaleCommand.RecordSaleItemCommand> items = new java.util.ArrayList<>();
        Matcher objectMatcher = ITEM_OBJECT_PATTERN.matcher(itemsArray);
        while (objectMatcher.find()) {
            String itemJson = objectMatcher.group();
            UUID productId = extractUuid(ITEM_PRODUCT_ID_PATTERN, itemJson);
            String productName = extractString(ITEM_PRODUCT_NAME_PATTERN, itemJson);
            Integer quantity = extractInt(itemJson);
            BigDecimal unitPrice = extractDecimal(ITEM_UNIT_PRICE_PATTERN, itemJson);
            if (productId == null || productName == null || quantity == null || unitPrice == null) {
                continue;
            }
            items.add(new RecordSaleCommand.RecordSaleItemCommand(productId, productName, quantity, unitPrice));
        }
        return items;
    }

    private String extractString(Pattern pattern, String payload) {
        Matcher matcher = pattern.matcher(payload);
        return matcher.find() ? matcher.group(1) : null;
    }

    private Integer extractInt(String payload) {
        Matcher matcher = ITEM_QUANTITY_PATTERN.matcher(payload);
        try {
            return matcher.find() ? Integer.parseInt(matcher.group(1)) : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private BigDecimal extractDecimal(Pattern pattern, String payload) {
        Matcher matcher = pattern.matcher(payload);
        try {
            return matcher.find() ? new BigDecimal(matcher.group(1)) : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private UUID extractUuid(Pattern pattern, String payload) {
        try {
            Matcher matcher = pattern.matcher(payload);
            return matcher.find() ? UUID.fromString(matcher.group(1)) : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private BigDecimal extractAmount(String payload) {
        try {
            Matcher matcher = AMOUNT_PATTERN.matcher(payload);
            return matcher.find() ? new BigDecimal(matcher.group(1)) : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private Instant extractInstant(String payload) {
        try {
            Matcher matcher = TIMESTAMP_PATTERN.matcher(payload);
            return matcher.find() ? Instant.parse(matcher.group(1)) : Instant.now();
        } catch (Exception ignored) {
            return Instant.now();
        }
    }
}
