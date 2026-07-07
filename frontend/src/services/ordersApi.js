import createApiClient, { getEnv } from "./apiClient";

const API_GATEWAY = getEnv("VITE_API_GATEWAY_URL", "http://localhost:8080");
const ORDERS_API = getEnv("VITE_ORDERS_API", API_GATEWAY);
const client = createApiClient(ORDERS_API);

export const createOrder = async (payload) => {
    const res = await client.post("/api/orders", payload);
    return res.data;
};

export const getOrderByCode = async (orderCode) => {
    const res = await client.get(`/api/orders/code/${orderCode}`);
    return res.data;
};

export const listActiveOrders = async (restaurantId) => {
    const res = await client.get(`/api/orders/active`, { params: { restaurantId } });
    return res.data;
};

export const listOrderHistory = async (restaurantId) => {
    const res = await client.get(`/api/orders/history`, { params: { restaurantId } });
    return res.data;
};

export const changeOrderStatus = async (orderId, status) => {
    const res = await client.patch(`/api/orders/${orderId}/status`, { status });
    return res.data;
};

export const notifyArrival = async (orderId) => {
    const res = await client.patch(`/api/orders/${orderId}/notify-arrival`);
    return res.data;
};

export const getOrdersByClient = async (clientId) => {
    const res = await client.get(`/api/orders/client/${clientId}`);
    return res.data;
};
