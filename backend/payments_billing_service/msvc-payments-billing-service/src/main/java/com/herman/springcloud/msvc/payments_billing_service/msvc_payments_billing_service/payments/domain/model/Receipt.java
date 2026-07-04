package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.exceptions.DomainException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class Receipt extends Entity {
    private final UUID paymentId;
    private final UUID orderId;
    private final UUID restaurantId;
    private final String receiptNumber;
    private final ReceiptType type;
    private final BigDecimal amount;
    private final String htmlContent;
    private final Instant issuedAt;

    public Receipt(UUID id, UUID paymentId, UUID orderId, UUID restaurantId, String receiptNumber, ReceiptType type,
                   BigDecimal amount, String htmlContent, Instant issuedAt) {
        super(id);
        if (paymentId == null || orderId == null || restaurantId == null) throw new DomainException("El comprobante requiere pago, pedido y restaurante");
        if (receiptNumber == null || receiptNumber.isBlank()) throw new DomainException("El numero de comprobante es obligatorio");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) throw new DomainException("El monto del comprobante debe ser mayor a cero");
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.restaurantId = restaurantId;
        this.receiptNumber = receiptNumber;
        this.type = type == null ? ReceiptType.BOLETA : type;
        this.amount = amount;
        this.htmlContent = htmlContent;
        this.issuedAt = issuedAt == null ? Instant.now() : issuedAt;
    }

    public static Receipt issue(UUID paymentId, UUID orderId, UUID restaurantId, ReceiptType type, BigDecimal amount) {
        String number = "RCPT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Instant issuedAt = Instant.now();
        String html = buildHtml(number, paymentId, orderId, type, amount, issuedAt);
        return new Receipt(UUID.randomUUID(), paymentId, orderId, restaurantId, number, type, amount, html, issuedAt);
    }

    private static String buildHtml(String number, UUID paymentId, UUID orderId, ReceiptType type, BigDecimal amount, Instant issuedAt) {
        String typeLabel = type == ReceiptType.FACTURA_SIMULADA ? "Factura simulada" : "Boleta simulada";
        String orderCode = "PED-" + orderId.toString().substring(0, 8).toUpperCase();
        String formattedDate = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                .withZone(ZoneId.systemDefault())
                .format(issuedAt);
        String formattedAmount = "Bs " + amount.setScale(2, RoundingMode.HALF_UP);

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                <meta charset="UTF-8">
                <title>Comprobante %s</title>
                <style>
                  :root{--ink:#211a15;--cream:#FAF5EE;--paper:#ffffff;--flame:#E4531F;--muted:#8c8178;--line:#EBE1D5}
                  *{box-sizing:border-box}
                  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px;background:radial-gradient(900px 500px at 50%% 0%%,#FFF3DE 0%%,var(--cream) 60%%);font-family:'Segoe UI',system-ui,sans-serif;color:var(--ink)}
                  .receipt{width:100%%;max-width:400px;background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:30px 28px;box-shadow:0 20px 44px -24px rgba(33,26,21,.3)}
                  .head{text-align:center;border-bottom:2px dashed var(--line);padding-bottom:18px;margin-bottom:18px}
                  .logo{width:40px;height:40px;border-radius:11px;background:var(--flame);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:22px;margin-bottom:10px}
                  h1{font-size:20px;margin:0}
                  .sub{font-size:12.5px;color:var(--muted);margin:3px 0 0}
                  .row{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:6px}
                  .row b{color:var(--ink);font-weight:700}
                  .total{display:flex;justify-content:space-between;font-size:22px;font-weight:800;border-top:1px solid var(--line);margin-top:14px;padding-top:14px}
                  .foot{text-align:center;font-size:11.5px;color:var(--muted);margin:20px 0 0;border-top:2px dashed var(--line);padding-top:16px}
                  .download-btn{display:block;width:100%%;margin-top:18px;padding:14px;border:0;border-radius:12px;background:var(--ink);color:#fff;font-weight:700;font-size:14.5px;cursor:pointer}
                </style>
                </head>
                <body>
                  <div class="receipt">
                    <div class="head">
                      <div class="logo">R</div>
                      <h1>RestoSys</h1>
                      <p class="sub">Comprobante de pago &middot; %s</p>
                      <p class="sub">%s</p>
                    </div>
                    <div class="row"><span>Nro. comprobante</span><b>%s</b></div>
                    <div class="row"><span>Pedido</span><b>%s</b></div>
                    <div class="total"><span>Total</span><span>%s</span></div>
                    <p class="foot">&iexcl;Gracias por tu compra! &middot; RestoSys</p>
                    <button class="download-btn" onclick="downloadReceiptPdf()">&#8681; Descargar PDF</button>
                  </div>
                  <script>
                    function downloadReceiptPdf(){
                      var token = localStorage.getItem('token');
                      fetch('http://localhost:8080/api/payments/%s/receipt.pdf', {
                        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
                      }).then(function(res){
                        if (!res.ok) throw new Error('No se pudo descargar el PDF');
                        return res.blob();
                      }).then(function(blob){
                        var url = URL.createObjectURL(blob);
                        var a = document.createElement('a');
                        a.href = url;
                        a.download = 'comprobante-%s.pdf';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }).catch(function(err){ alert(err.message); });
                    }
                  </script>
                </body>
                </html>
                """.formatted(number, typeLabel, formattedDate, number, orderCode, formattedAmount, paymentId, number);
    }

    public UUID getPaymentId() { return paymentId; }
    public UUID getOrderId() { return orderId; }
    public UUID getRestaurantId() { return restaurantId; }
    public String getReceiptNumber() { return receiptNumber; }
    public ReceiptType getType() { return type; }
    public BigDecimal getAmount() { return amount; }
    public String getHtmlContent() { return htmlContent; }
    public Instant getIssuedAt() { return issuedAt; }
}
