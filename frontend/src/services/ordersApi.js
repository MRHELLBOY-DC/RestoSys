import createApiClient, { getEnv } from "./apiClient";

const ORDERS_API = getEnv("VITE_ORDERS_API", "http://localhost:8002");
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

export const getOrdersByClient = async (clientId) => {
    const res = await client.get(`/api/orders/client/${clientId}`);
    return res.data;
};
