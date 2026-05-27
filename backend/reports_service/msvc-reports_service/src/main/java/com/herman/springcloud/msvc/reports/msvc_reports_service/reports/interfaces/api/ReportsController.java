package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.interfaces.api;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands.RecordAuditLogCommand;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands.RecordAuditLogCommandHandler;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands.RecordSaleCommand;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands.RecordSaleCommandHandler;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.queries.ReportQueriesHandler;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.security.JwtAuthenticationFilter.AuthenticatedUserPrincipal;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.interfaces.api.dto.AuditLogResponse;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.interfaces.api.dto.RecordAuditLogRequest;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.interfaces.api.dto.RecordSaleRequest;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.interfaces.api.dto.SaleRecordResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/reports")
public class ReportsController {
    private final RecordSaleCommandHandler recordSaleHandler;
    private final RecordAuditLogCommandHandler recordAuditLogHandler;
    private final ReportQueriesHandler reportQueriesHandler;

    public ReportsController(RecordSaleCommandHandler recordSaleHandler, RecordAuditLogCommandHandler recordAuditLogHandler,
                             ReportQueriesHandler reportQueriesHandler) {
        this.recordSaleHandler = recordSaleHandler;
        this.recordAuditLogHandler = recordAuditLogHandler;
        this.reportQueriesHandler = reportQueriesHandler;
    }

    @PostMapping("/sales-records")
    @ResponseStatus(HttpStatus.CREATED)
    public SaleRecordResponse recordSale(@RequestBody RecordSaleRequest request) {
        List<RecordSaleCommand.RecordSaleItemCommand> items = request.items() == null ? List.of() : request.items().stream()
                .map(item -> new RecordSaleCommand.RecordSaleItemCommand(item.productId(), item.productName(), item.quantity(), item.unitPrice()))
                .toList();
        return SaleRecordResponse.fromDomain(recordSaleHandler.handle(new RecordSaleCommand(
                request.restaurantId(), request.orderId(), request.paymentId(), request.clientId(), request.totalAmount(), request.soldAt(), items
        )));
    }

    @PostMapping("/audit-logs")
    @ResponseStatus(HttpStatus.CREATED)
    public AuditLogResponse recordAuditLog(@RequestBody RecordAuditLogRequest request) {
        return AuditLogResponse.fromDomain(recordAuditLogHandler.handle(new RecordAuditLogCommand(
                request.restaurantId(), request.source(), request.action(), request.detail(), request.occurredAt()
        )));
    }

    @GetMapping("/restaurants/{restaurantId}/sales-by-day")
    public List<ReportQueriesHandler.DailySalesReport> salesByDay(@PathVariable UUID restaurantId,
                                                                  @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
                                                                  @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
                                                                  Authentication authentication) {
        authorizeRestaurantAccess(restaurantId, authentication);
        return reportQueriesHandler.salesByDay(restaurantId, from, to);
    }

    @GetMapping("/restaurants/{restaurantId}/top-products")
    public List<ReportQueriesHandler.TopProductReport> topProducts(@PathVariable UUID restaurantId,
                                                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
                                                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
                                                                   @RequestParam(defaultValue = "5") int limit,
                                                                   Authentication authentication) {
        authorizeRestaurantAccess(restaurantId, authentication);
        return reportQueriesHandler.topProducts(restaurantId, from, to, limit);
    }

    @GetMapping("/admin/global-sales")
    public ReportQueriesHandler.GlobalSalesReport globalSales(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
                                                              @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        return reportQueriesHandler.globalSales(from, to);
    }

    @GetMapping("/admin/top-restaurants")
    public List<ReportQueriesHandler.TopRestaurantReport> topRestaurants(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
                                                                         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
                                                                         @RequestParam(defaultValue = "5") int limit) {
        return reportQueriesHandler.topRestaurants(from, to, limit);
    }

    @GetMapping("/audit-logs")
    public List<AuditLogResponse> auditLogs(@RequestParam(required = false) UUID restaurantId) {
        return reportQueriesHandler.auditLogs(restaurantId).stream().map(AuditLogResponse::fromDomain).toList();
    }

    private void authorizeRestaurantAccess(UUID restaurantId, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUserPrincipal user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token requerido");
        }
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_admin"))) {
            return;
        }
        Long restaurantNumericId = user.restaurantId();
        if (restaurantNumericId == null || !numericIdToUuid(restaurantNumericId).equals(restaurantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes acceder a reportes de otro restaurante");
        }
    }

    private UUID numericIdToUuid(Long id) {
        return UUID.fromString("00000000-0000-0000-0000-" + String.format("%012d", id));
    }
}
