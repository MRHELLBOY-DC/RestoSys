import createApiClient, { getEnv } from "./apiClient";

const API_GATEWAY = getEnv("VITE_API_GATEWAY_URL", "http://localhost:8080");
const PAYMENTS_API = getEnv("VITE_PAYMENTS_API", API_GATEWAY);
const client = createApiClient(PAYMENTS_API);

export const createPayment = async ({ orderId, restaurantId, clientId, amount, method }) => {
    const res = await client.post("/api/payments", { orderId, restaurantId, clientId, amount, method });
    return res.data;
};

export const simulateQrPayment = async (paymentId) => {
    const res = await client.patch(`/api/payments/${paymentId}/simulate-qr`);
    return res.data;
};

export const confirmCashPayment = async (paymentId, receiptType = "BOLETA") => {
    const res = await client.patch(`/api/payments/${paymentId}/confirm`, { receiptType });
    return res.data;
};

export const getPaymentByOrder = async (orderId) => {
    const res = await client.get(`/api/payments/order/${orderId}`);
    return res.data;
};

export const listPaymentsByRestaurant = async (restaurantId) => {
    const res = await client.get(`/api/payments`, { params: { restaurantId } });
    return res.data;
};

export const openReceipt = async (paymentId) => {
    const res = await client.get(`/api/payments/${paymentId}/receipt.html`);
    const blob = new Blob([res.data], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
};

export const downloadReceiptPdf = async (paymentId) => {
    const res = await client.get(`/api/payments/${paymentId}/receipt.pdf`, { responseType: 'blob' });
    const disposition = res.headers['content-disposition'] || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `comprobante-${paymentId}.pdf`;
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// aliases used by RestaurantePagos
export const confirmPayment = confirmCashPayment;
export const listPayments = listPaymentsByRestaurant;
export const getReceiptHtmlUrl = openReceipt;
export const getReceiptUrl = openReceipt;
