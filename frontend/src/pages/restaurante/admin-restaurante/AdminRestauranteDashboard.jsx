import { Link } from "react-router-dom";
import AdminShell from "../../../components/AdminShell";
import { useAuth } from "../../../hooks/useAuth";

export default function AdminRestauranteDashboard() {
    const { user, loading } = useAuth(['restaurante']);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="text-center">
                    <div className="spinner-border mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="h5">Cargando panel de administracion...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const displayName = user.full_name?.trim() || user.username || user.email || "";
    const restaurantName = user.restaurant?.name || "Tu restaurante";

    const quickActions = [
        {
            title: "Usuarios",
            description: "Control de roles y cuentas de tu restaurante.",
            action: "Gestionar",
            to: "/admin-restaurante/usuarios",
        },
        {
            title: "Reportes",
            description: "Visualiza estadisticas y rendimiento de tu restaurante.",
            action: "Ver reportes",
            to: "/admin-restaurante/reportes",
        },
        {
            title: "Pedidos",
            description: "Supervisa los pedidos en tiempo real.",
            action: "Supervisar",
            to: "/admin-restaurante/pedidos",
        },
        {
            title: "Menú",
            description: "Gestiona productos y categorías de tu restaurante.",
            action: "Gestionar",
            to: "/admin-restaurante/menu",
        }
    ];

    return (
        <AdminShell
            title={`Bienvenido de vuelta, ${displayName}`}
            subtitle={`Gestiona tu restaurante "${restaurantName}" desde un solo lugar.`}
        >
            <section className="admin-grid admin-grid-4">
                {quickActions.map((item) => (
                    <div key={item.title} className="admin-card admin-card--glass admin-action-card">
                        <div>
                            <h3 className="admin-action-title">{item.title}</h3>
                        </div>
                        <p className="admin-action-desc">{item.description}</p>
                        <Link to={item.to} className="admin-btn admin-btn-ghost text-decoration-none text-center">
                            {item.action} →
                        </Link>
                    </div>
                ))}
            </section>
        </AdminShell>
    );
}