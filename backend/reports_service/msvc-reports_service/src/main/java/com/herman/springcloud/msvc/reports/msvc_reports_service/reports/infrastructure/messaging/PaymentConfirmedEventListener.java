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
    private static final Pattern AMOUNT_PATTERN = Pattern.compile("\"amount\"\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)");
    private static final Pattern TIMESTAMP_PATTERN = Pattern.compile("\"timestamp\"\\s*:\\s*\"([^\"]+)\"");

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
        BigDecimal amount = extractAmount(payload);
        Instant occurredAt = extractInstant(payload);
        if (orderId == null || restaurantId == null || amount == null) {
            return;
        }
        recordSaleHandler.handle(new RecordSaleCommand(restaurantId, orderId, paymentId, amount, occurredAt, List.of()));
        recordAuditLogHandler.handle(new RecordAuditLogCommand(restaurantId, "payments-billing", "PAYMENT_CONFIRMED", payload, occurredAt));
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
