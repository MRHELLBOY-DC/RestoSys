import createApiClient, { getEnv } from "./apiClient";

const AUTH_API = getEnv("VITE_AUTH_API", "http://localhost:8000");
const MENU_API = getEnv("VITE_MENU_API", "http://localhost:8001");

const authClient = createApiClient(AUTH_API);
const menuClient = createApiClient(MENU_API);

// ============================================
// AUTH ENDPOINTS (puerto 8000)
// ============================================

export const loginUser = async (data) => {
    try {
        const res = await authClient.post("/api/login/", data);
        const result = res.data;
        if (result.success) {
            localStorage.setItem("token", result.access);
            localStorage.setItem("refresh_token", result.refresh);
            localStorage.setItem("user", JSON.stringify(result.user));
        }
        return result;
    } catch (err) {
        if (err?.status === 401 && err?.data) return err.data;
        return { success: false, message: err?.message || "Error al conectar con el servidor" };
    }
};

export const registerUser = async (data) => {
    const hasImage = data.restaurant_logo && data.restaurant_logo instanceof File;
    if (hasImage) {
        const formData = new FormData();
        formData.append('full_name', data.full_name);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('role', data.role);
        if (data.restaurant_name) formData.append('restaurant_name', data.restaurant_name);
        if (data.restaurant_address) formData.append('restaurant_address', data.restaurant_address);
        if (data.restaurant_logo) formData.append('restaurant_logo', data.restaurant_logo);
        const res = await authClient.post('/api/register/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        return res.data;
    }

    const res = await authClient.post('/api/register/', data);
    return res.data;
};

export const getProfile = async () => {
    try {
        const res = await authClient.get('/api/profile/');
        return res.data;
    } catch (err) {
        if (err?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
        }
        throw err;
    }
};

// ============================================
// ADMIN ENDPOINTS (puerto 8000)
// ============================================

export const getAdminUsuarios = async () => {
    try {
        const res = await authClient.get('/api/admin/usuarios/');
        return res.data;
    } catch (err) {
        if (err?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw new Error('No autorizado');
        }
        throw err;
    }
};

export const getAdminRestaurantes = async () => {
    try {
        const res = await authClient.get('/api/admin/restaurantes/');
        return res.data;
    } catch (err) {
        if (err?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw new Error('No autorizado');
        }
        throw err;
    }
};

export const createRestaurante = async (data) => {
    const res = await authClient.post('/api/admin/restaurantes/', data);
    return res.data;
};

export const createAdminUsuario = async (data) => {
    const res = await authClient.post('/api/admin/usuarios/', data);
    return res.data;
};

export const updateAdminUsuario = async (usuarioId, data) => {
    const res = await authClient.put(`/api/admin/usuarios/${usuarioId}/`, data);
    return res.data;
};

export const deleteAdminUsuario = async (usuarioId) => {
    const res = await authClient.delete(`/api/admin/usuarios/${usuarioId}/`);
    return res;
};

export const updateRestaurante = async (restauranteId, data) => {
    const res = await authClient.put(`/api/admin/restaurantes/${restauranteId}/`, data);
    return res.data;
};

export const deleteRestaurante = async (restauranteId) => {
    const res = await authClient.delete(`/api/admin/restaurantes/${restauranteId}/`);
    return res;
};

export const asignarRestaurante = async (usuarioId, restauranteId) => {
    const res = await authClient.post(`/api/admin/usuarios/${usuarioId}/asignar-restaurante/`, { restaurante_id: restauranteId });
    return res.data;
};

// ============================================
// PUBLIC ENDPOINTS (para la landing page)
// ============================================

export const getPublicRestaurantes = async () => {
    // Public endpoint should be called without attaching Authorization header
    const res = await fetch(`${AUTH_API}/api/public/restaurantes/`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw err;
    }
    return res.json();
};

// ============================================
// MENU ENDPOINTS (puerto 8001)
// ============================================

export const getCategories = async (restaurantId) => {
    const res = await menuClient.get('/api/public/categories/', { params: restaurantId ? { restaurant_id: restaurantId } : {} });
    return res.data;
};

export const getProducts = async (restaurantId) => {
    const res = await menuClient.get('/api/public/products/', { params: restaurantId ? { restaurant_id: restaurantId } : {} });
    return res.data;
};

export const createCategory = async (name, restaurantId) => {
    const res = await menuClient.post('/api/categories/', { name, restaurant_id: restaurantId });
    return res.data;
};

// ============================================
// UTILS
// ============================================

export const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error("Error parsing user:", e);
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
};

export const isAdmin = () => {
    const user = getCurrentUser();
    return user && user.role === 'admin';
};

export const isRestaurante = () => {
    const user = getCurrentUser();
    return user && user.role === 'restaurante';
};

export const isCliente = () => {
    const user = getCurrentUser();
    return user && user.role === 'cliente';
};