package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.infrastructure.pdf;

import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.Receipt;
import com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.domain.model.ReceiptType;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import java.io.ByteArrayOutputStream;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class ReceiptPdfRenderer {

    public static byte[] render(Receipt receipt) {
        String xhtml = buildXhtml(receipt);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(xhtml, null);
            builder.toStream(out);
            builder.run();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo generar el PDF del comprobante", e);
        }
    }

    private static String buildXhtml(Receipt receipt) {
        String typeLabel = receipt.getType() == ReceiptType.FACTURA_SIMULADA ? "Factura simulada" : "Boleta simulada";
        String orderCode = "PED-" + receipt.getOrderId().toString().substring(0, 8).toUpperCase();
        String formattedDate = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                .withZone(ZoneId.systemDefault())
                .format(receipt.getIssuedAt());
        String formattedAmount = "Bs " + receipt.getAmount().setScale(2, RoundingMode.HALF_UP);

        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                <meta charset="UTF-8" />
                <title>Comprobante</title>
                <style type="text/css">
                  @page { size: 320px 480px; margin: 0; }
                  body { margin: 0; padding: 28px 24px; font-family: Helvetica, Arial, sans-serif; color: #211a15; background-color: #ffffff; }
                  .logo { width: 40px; height: 40px; border-radius: 11px; background-color: #E4531F; color: #ffffff; font-weight: bold; font-size: 20px; text-align: center; }
                  h1 { font-size: 20px; margin: 10px 0 0 0; text-align: center; }
                  .sub { font-size: 11px; color: #8c8178; margin: 3px 0 0 0; text-align: center; }
                  .head { border-bottom: 2px dashed #EBE1D5; padding-bottom: 16px; margin-bottom: 16px; text-align: center; }
                  table.row { width: 100%%; border-collapse: collapse; margin-bottom: 6px; }
                  table.row td { font-size: 12px; padding: 0; }
                  table.row td.label { color: #8c8178; }
                  table.row td.value { color: #211a15; font-weight: bold; text-align: right; }
                  table.total { width: 100%%; border-collapse: collapse; border-top: 1px solid #EBE1D5; margin-top: 12px; }
                  table.total td { font-size: 19px; font-weight: bold; padding-top: 12px; }
                  table.total td.value { text-align: right; }
                  .foot { text-align: center; font-size: 10.5px; color: #8c8178; margin-top: 18px; border-top: 2px dashed #EBE1D5; padding-top: 14px; }
                </style>
                </head>
                <body>
                  <div class="head">
                    <table style="margin: 0 auto;"><tr><td class="logo">R</td></tr></table>
                    <h1>RestoSys</h1>
                    <p class="sub">Comprobante de pago &#183; %s</p>
                    <p class="sub">%s</p>
                  </div>
                  <table class="row"><tr><td class="label">Nro. comprobante</td><td class="value">%s</td></tr></table>
                  <table class="row"><tr><td class="label">Pedido</td><td class="value">%s</td></tr></table>
                  <table class="total"><tr><td>Total</td><td class="value">%s</td></tr></table>
                  <p class="foot">&#161;Gracias por tu compra! &#183; RestoSys</p>
                </body>
                </html>
                """.formatted(typeLabel, formattedDate, receipt.getReceiptNumber(), orderCode, formattedAmount);
    }
}
