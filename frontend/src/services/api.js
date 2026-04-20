const API = "http://localhost:8001";

//  LOGIN 
export const loginUser = async (data) => {
    const res = await fetch(`${API}/api/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    
    if (result.success) {
        // Guardar token y datos del usuario
        localStorage.setItem("token", result.access);
        localStorage.setItem("refresh_token", result.refresh);
        localStorage.setItem("user", JSON.stringify(result.user));
    }
    
    return result;
};

// REGISTER (mejorado)
export const registerUser = async (data) => {
    const res = await fetch(`${API}/api/register/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return res.json();
};

// OBTENER PERFIL (mejorado)
export const getProfile = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) return null;

    const res = await fetch(`${API}/api/profile/`, {
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

// Obtener usuario actual
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

// Logout
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
};

// Verificar si es admin
export const isAdmin = () => {
    const user = getCurrentUser();
    return user && user.role === 'admin';
};

// Verificar si es restaurante
export const isRestaurante = () => {
    const user = getCurrentUser();
    return user && user.role === 'restaurante';
};

// Verificar si es cliente
export const isCliente = () => {
    const user = getCurrentUser();
    return user && user.role === 'cliente';
};