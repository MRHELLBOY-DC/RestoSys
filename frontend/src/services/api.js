import createApiClient, { getEnv } from "./apiClient";

const AUTH_API = getEnv("VITE_AUTH_API", "http://localhost:8000");
const MENU_API = getEnv("VITE_MENU_API", "http://localhost:8001");

const authClient = createApiClient(AUTH_API);
const menuClient = createApiClient(MENU_API);

// ============================================
// INTERCEPTOR PARA MANEJAR ERRORES 403
// ============================================
authClient.interceptors.response.use(
    response => response,
    error => {
        // Si es error 403 (Forbidden)
        if (error.response?.status === 403) {
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.detail || 
                               'No tienes permiso para realizar esta acción';
            console.error('🔒 Permiso denegado:', errorMessage);
            
            // Crear un error personalizado con el mensaje
            const customError = new Error(errorMessage);
            customError.status = 403;
            customError.data = error.response?.data;
            
            // Opcional: Mostrar notificación al usuario (si tienes un sistema de toast)
            // toast.error(errorMessage);
            
            return Promise.reject(customError);
        }
        return Promise.reject(error);
    }
);

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
        if (err?.status === 401 && err?.data) {
            // Convertir error a message si existe
            const errorData = err.data;
            if (errorData.error) {
                return { success: false, message: errorData.error };
            }
            return errorData;
        }
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
    try {
        // data ya debe ser un objeto FormData desde el componente React
        const res = await authClient.post('/api/admin/restaurantes/', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    } catch (err) {
        if (err.response?.data) {
            throw err.response.data;
        }
        throw err;
    }
};

export const createAdminUsuario = async (data) => {
    try {
        const res = await authClient.post('/api/admin/usuarios/', data);
        return res.data;
    } catch (err) {
        if (err.response?.data) {
            throw err.response.data;
        }
        throw err;
    }
};

export const updateAdminUsuario = async (usuarioId, data) => {
    try {
        const res = await authClient.put(`/api/admin/usuarios/${usuarioId}/`, data);
        return res.data;
    } catch (err) {
        if (err.response?.data) {
            throw err.response.data;
        }
        throw err;
    }
};

export const deleteAdminUsuario = async (usuarioId) => {
    try {
        const res = await authClient.delete(`/api/admin/usuarios/${usuarioId}/`);
        return res;
    } catch (err) {
        if (err.response?.data) {
            throw err.response.data;
        }
        throw err;
    }
};

export const updateRestaurante = async (restauranteId, data) => {
    try {
        const res = await authClient.put(`/api/admin/restaurantes/${restauranteId}/`, data);
        return res.data;
    } catch (err) {
        if (err.response?.data) {
            throw err.response.data;
        }
        throw err;
    }
};

export const deleteRestaurante = async (restauranteId) => {
    try {
        const res = await authClient.delete(`/api/admin/restaurantes/${restauranteId}/`);
        return res;
    } catch (err) {
        if (err.response?.data) {
            throw err.response.data;
        }
        throw err;
    }
};

export const asignarRestaurante = async (usuarioId, restauranteId) => {
    try {
        const res = await authClient.post(`/api/admin/usuarios/${usuarioId}/asignar-restaurante/`, { restaurante_id: restauranteId });
        return res.data;
    } catch (err) {
        if (err.response?.data) {
            throw err.response.data;
        }
        throw err;
    }
};

// ============================================
// PUBLIC ENDPOINTS (para la landing page)
// ============================================

export const getPublicRestaurantes = async () => {
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
        const user = JSON.parse(userStr);
        if (user.role) {
            user.role = user.role.trim();
        }
        return user;
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

export const isEmpleado = () => {
    const user = getCurrentUser();
    return user && user.role === 'empleado';
};

export const isCliente = () => {
    const user = getCurrentUser();
    return user && user.role === 'cliente';
};