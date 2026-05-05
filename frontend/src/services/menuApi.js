const API = "http://localhost:8001";

// Helper para manejar errores
const handleResponse = async (res) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw error;
    }
    return res.json();
};

// Obtener token para autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
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

// Crear producto (con o sin imagen) - UNIFICADA
export const createProduct = async (data) => {
    const isFormData = data instanceof FormData;
    
    const headers = {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    };
    
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }
    
    const res = await fetch(`${API}/api/products/`, {
        method: "POST",
        headers: headers,
        body: isFormData ? data : JSON.stringify(data)
    });
    
    return handleResponse(res);
};

// Actualizar producto (con o sin imagen) - UNIFICADA
export const updateProduct = async (id, data) => {
    const isFormData = data instanceof FormData;
    
    const headers = {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    };
    
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }
    
    const res = await fetch(`${API}/api/products/${id}/`, {
        method: "PUT",
        headers: headers,
        body: isFormData ? data : JSON.stringify(data)
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
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const updateCategory = async (id, data) => {
    const res = await fetch(`${API}/api/categories/${id}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
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

// ========== OPCIONES (requieren auth y product_id) ==========
export const getOptions = async (productId) => {
    if (!productId) return [];
    const res = await fetch(`${API}/api/options/?product_id=${productId}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const createOption = async (data) => {
    const res = await fetch(`${API}/api/options/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const updateOption = async (id, data) => {
    const res = await fetch(`${API}/api/options/${id}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteOption = async (id) => {
    const res = await fetch(`${API}/api/options/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    if (res.status === 204) return null;
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