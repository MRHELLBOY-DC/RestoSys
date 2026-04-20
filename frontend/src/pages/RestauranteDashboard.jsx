import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function RestauranteDashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const currentUser = getCurrentUser();

            if (!token || currentUser?.role !== 'restaurante') {
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
            <h1>Panel del Restaurante</h1>
            <p><strong>Usuario:</strong> {user.username}</p>
            <p><strong>Rol:</strong> Restaurante</p>
            <p><strong>Restaurante:</strong> {user.restaurant?.name || 'No asignado'}</p>
            
            <div className="actions">
                <button onClick={() => navigate("/admin")}>
                    Gestionar Productos
                </button>
                <button onClick={() => navigate("/restaurante/pedidos")}>
                    Pedidos Activos
                </button>
                <button onClick={() => navigate("/restaurante/historial")}>
                    Historial de Ventas
                </button>
                <button onClick={() => navigate("/restaurante/reportes")}>
                    Reportes
                </button>
            </div>
            
            <button onClick={handleLogout} className="logout">
                Cerrar Sesión
            </button>
        </div>
    );
}