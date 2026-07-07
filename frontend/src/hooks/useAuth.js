// frontend/src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/api";

export const useAuth = (allowedRoles = []) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const currentUser = getCurrentUser();

            // Verificar si está autenticado
            if (!token || !currentUser) {
                navigate("/login");
                return;
            }

            // Verificar si tiene el rol permitido
            if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
                // Redirigir según el rol
                if (currentUser.role === 'admin') {
                    navigate("/admin/dashboard");
                } else if (currentUser.role === 'restaurante') {
                    navigate("/admin-restaurante/dashboard");  // ← Admin Restaurante a su panel
                } else if (currentUser.role === 'empleado') {
                    navigate("/restaurante/dashboard");  // ← Empleado al panel RESTAURANTE
                } else if (currentUser.role === 'repartidor') {
                    navigate("/repartidor/pedidos");  // ← Repartidor a su panel de entregas
                } else {
                    navigate("/cliente/dashboard");
                }
                return;
            }

            setUser(currentUser);
            setLoading(false);
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { user, loading };
};