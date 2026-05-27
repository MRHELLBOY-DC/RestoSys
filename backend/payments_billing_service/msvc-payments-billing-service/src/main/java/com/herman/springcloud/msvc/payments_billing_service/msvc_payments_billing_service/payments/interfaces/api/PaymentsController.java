package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.interfaces.api;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.commands.ConfirmPaymentCommand;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.commands.ConfirmPaymentCommandHandler;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.commands.CreatePaymentCommand;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.commands.CreatePaymentCommandHandler;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.queries.GetPaymentQueryHandler;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.queries.ListPaymentsQueryHandler;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.exceptions.DomainException;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Payment;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.ReceiptType;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.infrastructure.security.JwtAuthenticationFilter.AuthenticatedUserPrincipal;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.interfaces.api.dto.ConfirmPaymentRequest;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.interfaces.api.dto.CreatePaymentRequest;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.interfaces.api.dto.PaymentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/payments")
public class PaymentsController {
    private final CreatePaymentCommandHandler createPaymentHandler;
    private final ConfirmPaymentCommandHandler confirmPaymentHandler;
    private final GetPaymentQueryHandler getPaymentQueryHandler;
    private final ListPaymentsQueryHandler listPaymentsQueryHandler;

    public PaymentsController(CreatePaymentCommandHandler createPaymentHandler, ConfirmPaymentCommandHandler confirmPaymentHandler,
                              GetPaymentQueryHandler getPaymentQueryHandler, ListPaymentsQueryHandler listPaymentsQueryHandler) {
        this.createPaymentHandler = createPaymentHandler;
        this.confirmPaymentHandler = confirmPaymentHandler;
        this.getPaymentQueryHandler = getPaymentQueryHandler;
        this.listPaymentsQueryHandler = listPaymentsQueryHandler;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse create(@RequestBody CreatePaymentRequest request, Authentication authentication) {
        authorizeRestaurantAccess(request.restaurantId(), authentication);
        UUID clientId = isRole(authentication, "cliente")
                ? numericIdToUuid(authenticatedUser(authentication).id())
                : request.clientId();
        return PaymentResponse.fromDomain(createPaymentHandler.handle(
                new CreatePaymentCommand(request.orderId(), request.restaurantId(), clientId, request.amount(), request.method())
        ));
    }

    @PatchMapping("/{paymentId}/confirm")
    public PaymentResponse confirm(@PathVariable UUID paymentId, @RequestBody(required = false) ConfirmPaymentRequest request, Authentication authentication) {
        Payment payment = getPaymentQueryHandler.handle(paymentId);
        authorizeRestaurantAccess(payment.getRestaurantId(), authentication);
        ReceiptType receiptType = request == null || request.receiptType() == null ? ReceiptType.BOLETA : request.receiptType();
        return PaymentResponse.fromDomain(confirmPaymentHandler.handle(new ConfirmPaymentCommand(paymentId, receiptType)));
    }

    @PatchMapping("/{paymentId}/simulate-qr")
    public PaymentResponse simulateQr(@PathVariable UUID paymentId, Authentication authentication) {
        Payment payment = getPaymentQueryHandler.handle(paymentId);
        authorizeRestaurantAccess(payment.getRestaurantId(), authentication);
        return PaymentResponse.fromDomain(confirmPaymentHandler.handle(new ConfirmPaymentCommand(paymentId, ReceiptType.BOLETA)));
    }

    @GetMapping("/{paymentId}")
    public PaymentResponse getById(@PathVariable UUID paymentId, Authentication authentication) {
        Payment payment = getPaymentQueryHandler.handle(paymentId);
        authorizeRestaurantAccess(payment.getRestaurantId(), authentication);
        return PaymentResponse.fromDomain(payment);
    }

    @GetMapping("/order/{orderId}")
    public PaymentResponse getByOrder(@PathVariable UUID orderId, Authentication authentication) {
        Payment payment = getPaymentQueryHandler.handleByOrder(orderId);
        authorizeRestaurantAccess(payment.getRestaurantId(), authentication);
        return PaymentResponse.fromDomain(payment);
    }

    @GetMapping
    public List<PaymentResponse> list(@RequestParam UUID restaurantId, Authentication authentication) {
        authorizeRestaurantAccess(restaurantId, authentication);
        return listPaymentsQueryHandler.handle(restaurantId).stream().map(PaymentResponse::fromDomain).toList();
    }

    @GetMapping(value = "/{paymentId}/receipt.html", produces = MediaType.TEXT_HTML_VALUE)
    public String getReceiptHtml(@PathVariable UUID paymentId, Authentication authentication) {
        Payment payment = getPaymentQueryHandler.handle(paymentId);
        authorizeRestaurantAccess(payment.getRestaurantId(), authentication);
        if (payment.getReceipt() == null) {
            throw new DomainException("El comprobante todavia no fue generado porque el pago no esta confirmado");
        }
        return payment.getReceipt().getHtmlContent();
    }

    private void authorizeRestaurantAccess(UUID restaurantId, Authentication authentication) {
        if (!isRole(authentication, "restaurante")) {
            return;
        }
        Long restaurantNumericId = authenticatedUser(authentication).restaurantId();
        if (restaurantNumericId == null || !numericIdToUuid(restaurantNumericId).equals(restaurantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes acceder a pagos de otro restaurante");
        }
    }

    private AuthenticatedUserPrincipal authenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUserPrincipal user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token requerido");
        }
        return user;
    }

    private boolean isRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }

    private UUID numericIdToUuid(Long id) {
        return UUID.fromString("00000000-0000-0000-0000-" + String.format("%012d", id));
    }
}
