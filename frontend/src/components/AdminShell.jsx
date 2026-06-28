import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/api";
import "../styles/admin-ui.css";

export default function AdminShell({ title, subtitle, actions, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const user = getCurrentUser();
    const displayName = user?.full_name?.trim() || user?.username || user?.email || "Admin";
    const handleLabel = user?.email || user?.username || "";
    const initials = displayName.slice(0, 2).toUpperCase();

    const isSuperAdmin = user?.role === 'admin';
    const isAdminRestaurante = user?.role === 'restaurante';

    // Menú dinámico según el rol
    const navItems = isSuperAdmin ? [
        { to: "/admin/dashboard", label: "Dashboard", meta: "Inicio" },
        { to: "/admin/restaurantes", label: "Restaurantes", meta: "Red" },
        { to: "/admin/usuarios", label: "Usuarios", meta: "Roles" },
        { to: "/admin/reportes", label: "Reportes", meta: "Global" },
        { to: "/admin/auditoria", label: "Auditoria", meta: "Logs" }
    ] : isAdminRestaurante ? [
        { to: "/admin-restaurante/dashboard", label: "Dashboard", meta: "Inicio" },
        { to: "/admin-restaurante/usuarios", label: "Usuarios", meta: "Roles" },
        { to: "/admin-restaurante/reportes", label: "Reportes", meta: "Global" },
        { to: "/admin-restaurante/pedidos", label: "Pedidos", meta: "Supervisión" },
        { to: "/admin-restaurante/menu", label: "Menú", meta: "Productos" }
    ] : [];

    // Determinar la ruta base del brand según el rol
    const brandPath = isSuperAdmin ? "/admin/dashboard" : 
                      isAdminRestaurante ? "/admin-restaurante/dashboard" : 
                      "/admin/dashboard";

    const brandSubtitle = isSuperAdmin ? "Admin Console" : 
                          isAdminRestaurante ? "Restaurante Console" : 
                          "Admin Console";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className={`admin-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
            <aside className="admin-sidebar">
                <Link to={brandPath} className="admin-brand text-decoration-none">
                    <div className="admin-brand-icon">RS</div>
                    <div className="admin-brand-text">
                        <p className="admin-brand-title mb-0">RestoSys</p>
                        <span className="admin-brand-subtitle">{brandSubtitle}</span>
                    </div>
                </Link>

                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="admin-nav-label">
                                <span className="admin-nav-icon">{item.label.slice(0, 1)}</span>
                                {item.label}
                            </span>
                            <span className="admin-nav-meta">{item.meta}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button
                            type="button"
                            className="admin-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Abrir menu"
                        >
                            ☰
                        </button>
                        <h2 className="admin-topbar-title">Panel de administracion</h2>
                    </div>

                    <div className="admin-topbar-actions">
                        <div className="admin-user">
                            <div className="admin-user-avatar">{initials}</div>
                            <div className="admin-user-meta">
                                <span>{displayName}</span>
                            </div>
                        </div>
                        <button type="button" className="admin-btn admin-btn-ghost" onClick={handleLogout}>
                            Salir
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    <div className="admin-header">
                        <div>
                            <h1 className="admin-title">{title}</h1>
                            {subtitle && <p className="admin-subtitle">{subtitle}</p>}
                        </div>
                        {actions && <div className="admin-actions">{actions}</div>}
                    </div>
                    {children}
                </div>
            </div>

            {sidebarOpen && <div className="admin-mobile-overlay" onClick={() => setSidebarOpen(false)} />}
        </div>
    );
}