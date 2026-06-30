import createApiClient, { getEnv } from "./apiClient";

const API_GATEWAY = getEnv("VITE_API_GATEWAY_URL", "http://localhost:8080");
const API = getEnv("VITE_MENU_API", API_GATEWAY);
const client = createApiClient(API);

// ========== PRODUCTOS (requieren auth) ==========
export const getProducts = async (restaurantId) => {
    const res = await client.get(`/api/products/`, { params: restaurantId ? { restaurant_id: restaurantId } : {} });
    return res.data;
};

// Crear producto (con o sin imagen) - UNIFICADA
export const createProduct = async (data) => {
    // axios handles FormData automatically in the browser
    const res = await client.post(`/api/products/`, data);
    return res.data;
};

// Actualizar producto (con o sin imagen) - UNIFICADA
export const updateProduct = async (id, data) => {
    const res = await client.put(`/api/products/${id}/`, data);
    return res.data;
};

export const deleteProduct = async (id) => {
    const res = await client.delete(`/api/products/${id}/`);
    if (res.status === 204) return null;
    return res.data;
};

// ========== CATEGORÍAS (requieren auth) ==========
export const getCategories = async (restaurantId) => {
    const res = await client.get(`/api/categories/`, { params: restaurantId ? { restaurant_id: restaurantId } : {} });
    return res.data;
};

export const createCategory = async (data) => {
    const res = await client.post(`/api/categories/`, data);
    return res.data;
};

export const updateCategory = async (id, data) => {
    const res = await client.put(`/api/categories/${id}/`, data);
    return res.data;
};

export const deleteCategory = async (id) => {
    const res = await client.delete(`/api/categories/${id}/`);
    if (res.status === 204) return null;
    return res.data;
};

// ========== OPCIONES (requieren auth y product_id) ==========
export const getOptions = async (productId) => {
    if (!productId) return [];
    const res = await client.get(`/api/options/`, { params: { product_id: productId } });
    return res.data;
};

export const createOption = async (data) => {
    const res = await client.post(`/api/options/`, data);
    return res.data;
};

export const updateOption = async (id, data) => {
    const res = await client.put(`/api/options/${id}/`, data);
    return res.data;
};

export const deleteOption = async (id) => {
    const res = await client.delete(`/api/options/${id}/`);
    if (res.status === 204) return null;
    return res.data;
};

// ========== ENDPOINTS PÚBLICOS (sin autenticación) ==========
export const getPublicProducts = async (restaurantId = null) => {
    // Call public menu endpoints without auth header to avoid 401 if token is invalid
    const url = new URL(`/api/public/products/`, window.location.origin);
    url.hostname = (new URL(API)).hostname || url.hostname;
    url.port = (new URL(API)).port || url.port;
    if (restaurantId) url.searchParams.set('restaurant_id', restaurantId);
    const res = await fetch(`${API}/api/public/products/${restaurantId ? `?restaurant_id=${restaurantId}` : ''}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw err;
    }
    return res.json();
};

export const getPublicCategories = async (restaurantId = null) => {
    const res = await fetch(`${API}/api/public/categories/${restaurantId ? `?restaurant_id=${restaurantId}` : ''}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw err;
    }
    return res.json();
};
