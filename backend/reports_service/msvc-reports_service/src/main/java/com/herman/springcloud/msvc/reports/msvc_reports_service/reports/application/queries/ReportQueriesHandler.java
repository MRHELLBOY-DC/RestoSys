package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.queries;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports.AuditLogRepository;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports.SaleRecordRepository;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.AuditLog;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.SaleItem;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.SaleRecord;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportQueriesHandler {
    private final SaleRecordRepository saleRecordRepository;
    private final AuditLogRepository auditLogRepository;

    public ReportQueriesHandler(SaleRecordRepository saleRecordRepository, AuditLogRepository auditLogRepository) {
        this.saleRecordRepository = saleRecordRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<DailySalesReport> salesByDay(UUID restaurantId, Instant from, Instant to) {
        return saleRecordRepository.findByRestaurantIdAndSoldAtBetween(restaurantId, from, to).stream()
                .collect(Collectors.groupingBy(sale -> LocalDate.ofInstant(sale.getSoldAt(), ZoneOffset.UTC)))
                .entrySet()
                .stream()
                .map(entry -> new DailySalesReport(
                        entry.getKey(),
                        entry.getValue().size(),
                        entry.getValue().stream().map(SaleRecord::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .sorted(Comparator.comparing(DailySalesReport::date))
                .toList();
    }

    public List<TopProductReport> topProducts(UUID restaurantId, Instant from, Instant to, int limit) {
        Map<UUID, List<SaleItem>> groupedItems = saleRecordRepository.findByRestaurantIdAndSoldAtBetween(restaurantId, from, to)
                .stream()
                .flatMap(sale -> sale.getItems().stream())
                .collect(Collectors.groupingBy(SaleItem::getProductId));
        return groupedItems.entrySet().stream()
                .map(entry -> new TopProductReport(
                        entry.getKey(),
                        entry.getValue().getFirst().getProductName(),
                        entry.getValue().stream().mapToInt(SaleItem::getQuantity).sum(),
                        entry.getValue().stream().map(SaleItem::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .sorted(Comparator.comparing(TopProductReport::quantitySold).reversed())
                .limit(Math.max(1, limit))
                .toList();
    }

    public GlobalSalesReport globalSales(Instant from, Instant to) {
        List<SaleRecord> sales = saleRecordRepository.findBySoldAtBetween(from, to);
        return new GlobalSalesReport(
                sales.size(),
                sales.stream().map(SaleRecord::getRestaurantId).distinct().count(),
                sales.stream().map(SaleRecord::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add)
        );
    }

    public List<TopRestaurantReport> topRestaurants(Instant from, Instant to, int limit) {
        return saleRecordRepository.findBySoldAtBetween(from, to).stream()
                .collect(Collectors.groupingBy(SaleRecord::getRestaurantId))
                .entrySet()
                .stream()
                .map(entry -> new TopRestaurantReport(
                        entry.getKey(),
                        entry.getValue().size(),
                        entry.getValue().stream().map(SaleRecord::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .sorted(Comparator.comparing(TopRestaurantReport::totalSales).reversed())
                .limit(Math.max(1, limit))
                .toList();
    }

    public List<AuditLog> auditLogs(UUID restaurantId) {
        return restaurantId == null ? auditLogRepository.findAll() : auditLogRepository.findByRestaurantId(restaurantId);
    }

    public record DailySalesReport(LocalDate date, long ordersCount, BigDecimal totalSales) {
    }

    public record TopProductReport(UUID productId, String productName, int quantitySold, BigDecimal totalSales) {
    }

    public record GlobalSalesReport(long ordersCount, long restaurantsCount, BigDecimal totalSales) {
    }

    public record TopRestaurantReport(UUID restaurantId, long ordersCount, BigDecimal totalSales) {
    }
}
