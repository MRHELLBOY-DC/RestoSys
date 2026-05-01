import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const currentUser = getCurrentUser();

            if (!token || currentUser?.role !== 'admin') {
                console.log("No autorizado, redirigiendo a login");
                navigate("/login");
                return;
            }

            setUser(currentUser);
        };
        
        checkAuth();
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) return <p>Cargando...</p>;

    return (
        <div className="dashboard">
            <h1>Panel de Administración</h1>
            <p><strong>Usuario:</strong> {user.username}</p>
            <p><strong>Rol:</strong> Administrador</p>
            
            <div className="actions">
                <button onClick={() => navigate("/admin/restaurantes")}>
                    Gestionar Restaurantes
                </button>
                <button onClick={() => navigate("/admin/usuarios")}>
                    Gestionar Usuarios
                </button>
                <button onClick={() => navigate("")}>
                    Reportes Globales
                </button>
            </div>
            
            <button onClick={handleLogout} className="logout">
                Cerrar Sesión
            </button>
        </div>
    );
}