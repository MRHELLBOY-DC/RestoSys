package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.interfaces.api;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.commands.*;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.queries.GetPaymentQueryHandler;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.application.queries.ListPaymentsQueryHandler;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.exceptions.DomainException;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Payment;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.ReceiptType;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.interfaces.api.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

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
    public PaymentResponse create(@RequestBody CreatePaymentRequest request) {
        return PaymentResponse.fromDomain(createPaymentHandler.handle(
                new CreatePaymentCommand(request.orderId(), request.restaurantId(), request.amount(), request.method())
        ));
    }

    @PatchMapping("/{paymentId}/confirm")
    public PaymentResponse confirm(@PathVariable UUID paymentId, @RequestBody(required = false) ConfirmPaymentRequest request) {
        ReceiptType receiptType = request == null || request.receiptType() == null ? ReceiptType.BOLETA : request.receiptType();
        return PaymentResponse.fromDomain(confirmPaymentHandler.handle(new ConfirmPaymentCommand(paymentId, receiptType)));
    }

    @PatchMapping("/{paymentId}/simulate-qr")
    public PaymentResponse simulateQr(@PathVariable UUID paymentId) {
        return PaymentResponse.fromDomain(confirmPaymentHandler.handle(new ConfirmPaymentCommand(paymentId, ReceiptType.BOLETA)));
    }

    @GetMapping("/{paymentId}")
    public PaymentResponse getById(@PathVariable UUID paymentId) {
        return PaymentResponse.fromDomain(getPaymentQueryHandler.handle(paymentId));
    }

    @GetMapping("/order/{orderId}")
    public PaymentResponse getByOrder(@PathVariable UUID orderId) {
        return PaymentResponse.fromDomain(getPaymentQueryHandler.handleByOrder(orderId));
    }

    @GetMapping
    public List<PaymentResponse> list(@RequestParam UUID restaurantId) {
        return listPaymentsQueryHandler.handle(restaurantId).stream().map(PaymentResponse::fromDomain).toList();
    }

    @GetMapping(value = "/{paymentId}/receipt.html", produces = MediaType.TEXT_HTML_VALUE)
    public String getReceiptHtml(@PathVariable UUID paymentId) {
        Payment payment = getPaymentQueryHandler.handle(paymentId);
        if (payment.getReceipt() == null) {
            throw new DomainException("El comprobante todavia no fue generado porque el pago no esta confirmado");
        }
        return payment.getReceipt().getHtmlContent();
    }
}
