const ORDERS_API = "http://localhost:8002";

const handleResponse = async (res) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Error desconocido" }));
        throw error;
    }
    return res.json();
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const createOrder = async (payload) => {
    const res = await fetch(`${ORDERS_API}/api/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
    });
    return handleResponse(res);
};

export const getOrderByCode = async (orderCode) => {
    const res = await fetch(`${ORDERS_API}/api/orders/code/${orderCode}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const listActiveOrders = async (restaurantId) => {
    const res = await fetch(`${ORDERS_API}/api/orders/active?restaurantId=${restaurantId}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const listOrderHistory = async (restaurantId) => {
    const res = await fetch(`${ORDERS_API}/api/orders/history?restaurantId=${restaurantId}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const changeOrderStatus = async (orderId, status) => {
    const res = await fetch(`${ORDERS_API}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify({ status })
    });
    return handleResponse(res);
};

export const confirmOrderPayment = async (orderId) => {
    const res = await fetch(`${ORDERS_API}/api/orders/${orderId}/confirm-payment`, {
        method: "PATCH",
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};
