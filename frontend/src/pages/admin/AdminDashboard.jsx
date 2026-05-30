import { Link } from "react-router-dom";
import AdminShell from "../../components/AdminShell";
import { useAuth } from "../../hooks/useAuth";

export default function AdminDashboard() {
    const { user, loading } = useAuth(['admin']);

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

    const quickActions = [
        {
            title: "Restaurantes",
            description: "Registra, edita o pausa establecimientos de la red.",
            action: "Gestionar",
            to: "/admin/restaurantes",
        },
        {
            title: "Usuarios",
            description: "Control de roles y cuentas de duenos y staff.",
            action: "Gestionar",
            to: "/admin/usuarios",
        },
        {
            title: "Reportes",
            description: "Visualiza estadisticas y rendimiento global.",
            action: "Ver reportes",
            to: "/admin/reportes",
        },
        {
            title: "Auditoria",
            description: "Registro de acciones y eventos de la plataforma.",
            action: "Ver auditoria",
            to: "/admin/auditoria",
        },
    ];

    return (
        <AdminShell
            title={`Bienvenido de vuelta, ${displayName}`}
            subtitle="Gestiona toda la plataforma MenuRojo desde un solo lugar."
            actions={(
                <Link to="/admin/restaurantes" className="admin-btn admin-btn-primary text-decoration-none">
                    + Alta de restaurante
                </Link>
            )}
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
