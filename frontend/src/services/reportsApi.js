import { createApiClient, getEnv } from "./apiClient";

const REPORTS_API = getEnv("VITE_REPORTS_API_URL", "http://localhost:8004");
const reportsClient = createApiClient(REPORTS_API);

const unwrap = (res) => res.data;

export const getSalesByDay = async (restaurantId, from, to) => {
    return unwrap(await reportsClient.get(`/api/reports/restaurants/${restaurantId}/sales-by-day`, {
        params: { from, to }
    }));
};

export const getTopProducts = async (restaurantId, from, to, limit = 5) => {
    return unwrap(await reportsClient.get(`/api/reports/restaurants/${restaurantId}/top-products`, {
        params: { from, to, limit }
    }));
};

export const getGlobalSales = async (from, to) => {
    return unwrap(await reportsClient.get("/api/reports/admin/global-sales", {
        params: { from, to }
    }));
};

export const getTopRestaurants = async (from, to, limit = 5) => {
    return unwrap(await reportsClient.get("/api/reports/admin/top-restaurants", {
        params: { from, to, limit }
    }));
};

export const getAuditLogs = async (restaurantId) => {
    const params = restaurantId ? { restaurantId } : {};
    return unwrap(await reportsClient.get("/api/reports/audit-logs", { params }));
};

export const recordSale = async (payload) => {
    return unwrap(await reportsClient.post("/api/reports/sales-records", payload));
};

export const recordAuditLog = async (payload) => {
    return unwrap(await reportsClient.post("/api/reports/audit-logs", payload));
};
