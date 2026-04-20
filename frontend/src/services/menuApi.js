const API = "http://localhost:8002";

// Helper para manejar errores
const handleResponse = async (res) => {
    if (!res.ok) {
        const error = await res.json();
        throw error;
    }
    return res.json();
};

// Obtener token para autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

// ========== PRODUCTOS (requieren auth) ==========
export const getProducts = async () => {
    const res = await fetch(`${API}/api/products/`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const createProduct = async (data) => {
    const res = await fetch(`${API}/api/products/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const updateProduct = async (id, data) => {
    const res = await fetch(`${API}/api/products/${id}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteProduct = async (id) => {
    const res = await fetch(`${API}/api/products/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    if (res.status === 204) return null;
    return handleResponse(res);
};

// ========== CATEGORÍAS (requieren auth) ==========
export const getCategories = async () => {
    const res = await fetch(`${API}/api/categories/`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const createCategory = async (data) => {
    const res = await fetch(`${API}/api/categories/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const updateCategory = async (id, data) => {
    const res = await fetch(`${API}/api/categories/${id}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteCategory = async (id) => {
    const res = await fetch(`${API}/api/categories/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    if (res.status === 204) return null;
    return handleResponse(res);
};

// ========== OPCIONES (requieren auth) ==========
export const getOptions = async () => {
    const res = await fetch(`${API}/api/options/`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const createOption = async (data) => {
    const res = await fetch(`${API}/api/options/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// ========== ENDPOINTS PÚBLICOS (sin autenticación) ==========
export const getPublicProducts = async (restaurantId = null) => {
    let url = `${API}/api/public/products/`;
    if (restaurantId) {
        url += `?restaurant_id=${restaurantId}`;
    }
    const res = await fetch(url);
    return handleResponse(res);
};

export const getPublicCategories = async (restaurantId = null) => {
    let url = `${API}/api/public/categories/`;
    if (restaurantId) {
        url += `?restaurant_id=${restaurantId}`;
    }
    const res = await fetch(url);
    return handleResponse(res);
};