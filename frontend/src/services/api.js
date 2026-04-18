const API = "http://localhost:8001";

// 🔐 LOGIN (JWT)
export const loginUser = async (data) => {
    const res = await fetch(`${API}/api/token/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return res.json();
};

// 📝 REGISTER
export const registerUser = async (data) => {
    const res = await fetch(`${API}/api/register/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    console.log("REGISTER STATUS:", res.status);
    console.log("REGISTER RESPONSE:", result);

    return result;
};

// 🔥 NUEVO: OBTENER PERFIL (PROTEGIDO)
export const getProfile = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/api/profile/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`   // 👈 CLAVE
        }
    });

    return res.json();
};