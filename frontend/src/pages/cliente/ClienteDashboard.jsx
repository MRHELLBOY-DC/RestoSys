import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function ClienteDashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const currentUser = getCurrentUser();

        if (!token || currentUser?.role !== 'cliente') {
            navigate("/login");
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(currentUser);
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) return <p>Cargando...</p>;

    return (
        <div className="dashboard">
            <h1>Menú Digital</h1>
            <p><strong>Bienvenido:</strong> {user.username}</p>
            <p><strong>Rol:</strong> Cliente</p>
            
            <div className="actions">
                <button onClick={() => navigate("/menu")}>
                    Ver Menú
                </button>
                <button onClick={() => navigate("/carrito")}>
                    Mi Carrito
                </button>
                <button onClick={() => navigate("/mis-pedidos")}>
                    Mis Pedidos
                </button>
            </div>
            
            <button onClick={handleLogout} className="logout">
                Cerrar Sesión
            </button>
        </div>
    );
}