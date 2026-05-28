import createApiClient, { getEnv } from "./apiClient";

const PAYMENTS_API = getEnv("VITE_PAYMENTS_API", "http://localhost:8003");
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

// aliases used by RestaurantePagos
export const confirmPayment = confirmCashPayment;
export const listPayments = listPaymentsByRestaurant;
export const getReceiptHtmlUrl = openReceipt;
export const getReceiptUrl = openReceipt;
