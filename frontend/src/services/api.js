const AUTH_API = "http://localhost:8000";
//const AUTH_API = "http://restosys-main-auth-1:8000";
//const MENU_API = "http://host.docker.internal:8001";
const MENU_API = "http://localhost:8001";

const handleAuthResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw data;
    }
    return data;
};

// ============================================
// AUTH ENDPOINTS (puerto 8000)
// ============================================

// LOGIN
export const loginUser = async (data) => {
    const res = await fetch(`${AUTH_API}/api/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    
    if (result.success) {
        localStorage.setItem("token", result.access);
        localStorage.setItem("refresh_token", result.refresh);
        localStorage.setItem("user", JSON.stringify(result.user));
    }
    
    return result;
};

// REGISTER (modificado para soportar imágenes)
export const registerUser = async (data) => {
    // Verificar si tenemos que enviar una imagen (logo)
    const hasImage = data.restaurant_logo && data.restaurant_logo instanceof File;
    
    let body;
    let headers = {};
    
    if (hasImage) {
        // Enviar como FormData para la imagen
        const formData = new FormData();
        formData.append('full_name', data.full_name);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('role', data.role);
        
        if (data.restaurant_name) {
            formData.append('restaurant_name', data.restaurant_name);
        }
        if (data.restaurant_address) {
            formData.append('restaurant_address', data.restaurant_address);
        }
        if (data.restaurant_logo) {
            formData.append('restaurant_logo', data.restaurant_logo);
        }
        
        body = formData;
        // No establecer Content-Type, el navegador lo hará automáticamente con el boundary
    } else {
        // Enviar como JSON
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
    }
    
    const res = await fetch(`${AUTH_API}/api/register/`, {
        method: "POST",
        headers: headers,
        body: body
    });

    return res.json();
};

// OBTENER PERFIL
export const getProfile = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) return null;

    const res = await fetch(`${AUTH_API}/api/profile/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
    }

    return res.json();
};

// ============================================
// ADMIN ENDPOINTS (puerto 8000)
// ============================================

// Obtener lista de usuarios
export const getAdminUsuarios = async () => {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${AUTH_API}/api/admin/usuarios/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    
    if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("No autorizado");
    }
    
    return res.json();
};

// Obtener lista de restaurantes
export const getAdminRestaurantes = async () => {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${AUTH_API}/api/admin/restaurantes/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    
    if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("No autorizado");
    }
    
    return res.json();
};

// Crear restaurante
export const createRestaurante = async (data) => {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${AUTH_API}/api/admin/restaurantes/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    
    return res.json();
};

// Crear usuario (admin)
export const createAdminUsuario = async (data) => {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${AUTH_API}/api/admin/usuarios/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    
    return handleAuthResponse(res);
};

// Actualizar usuario
export const updateAdminUsuario = async (usuarioId, data) => {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${AUTH_API}/api/admin/usuarios/${usuarioId}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    
    return handleAuthResponse(res);
};

// Eliminar usuario
export const deleteAdminUsuario = async (usuarioId) => {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${AUTH_API}/api/admin/usuarios/${usuarioId}/`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return res;
};

// Actualizar restaurante
export const updateRestaurante = async (restauranteId, data) => {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${AUTH_API}/api/admin/restaurantes/${restauranteId}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    
    return res.json();
};

// Eliminar restaurante
export const deleteRestaurante = async (restauranteId) => {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${AUTH_API}/api/admin/restaurantes/${restauranteId}/`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return res;
};

// Asignar restaurante a usuario
export const asignarRestaurante = async (usuarioId, restauranteId) => {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${AUTH_API}/api/admin/usuarios/${usuarioId}/asignar-restaurante/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ restaurante_id: restauranteId })
    });
    
    return res.json();
};

// ============================================
// PUBLIC ENDPOINTS (para la landing page)
// ============================================

// Obtener lista de restaurantes públicos (para la landing page)
export const getPublicRestaurantes = async () => {
    const res = await fetch(`${AUTH_API}/api/public/restaurantes/`);
    return res.json();
};

// ============================================
// MENU ENDPOINTS (puerto 8001)
// ============================================

export const getCategories = async (restaurantId) => {
    const token = localStorage.getItem("token");
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};
    
    const res = await fetch(`${MENU_API}/api/public/categories/?restaurant_id=${restaurantId}`, {
        method: "GET",
        headers
    });
    
    return res.json();
};

export const getProducts = async (restaurantId) => {
    const token = localStorage.getItem("token");
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};
    
    const res = await fetch(`${MENU_API}/api/public/products/?restaurant_id=${restaurantId}`, {
        method: "GET",
        headers
    });
    
    return res.json();
};

export const createCategory = async (name, restaurantId) => {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${MENU_API}/api/categories/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, restaurant_id: restaurantId })
    });
    
    return res.json();
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