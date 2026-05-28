import axios from "axios";

// Factory to create axios instances with auth interceptor and simple error normalization
export function createApiClient(baseURL) {
    const client = axios.create({
        baseURL,
        timeout: 10000,
    });

    // attach token automatically
    client.interceptors.request.use((config) => {
        // Do not attach Authorization header for public endpoints
        const url = typeof config.url === 'string' ? config.url : '';
        if (url.includes('/api/public/')) return config;

        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    // return full response so callers can inspect status/data when needed
    client.interceptors.response.use(
        (res) => res,
        (err) => {
            // include status and data when available for callers to handle 401/403
            const status = err.response?.status;
            const data = err.response?.data || { message: err.message || "Error desconocido" };
            return Promise.reject({ status, data, message: data.message || err.message });
        }
    );

    return client;
}

// helpers to pick base urls from Vite env with fallbacks
export const getEnv = (name, fallback) => import.meta.env[name] || fallback;

export default createApiClient;
