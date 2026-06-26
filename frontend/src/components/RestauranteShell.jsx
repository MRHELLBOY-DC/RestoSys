import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/api";

export default function RestauranteShell({ title, subtitle, actions, children }) {
    const user = getCurrentUser();
    const navigate = useNavigate();

    const initials = (user?.full_name || user?.email || "").split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    // Determinar el rol del usuario para mostrar en el subtítulo
    const roleLabel = user?.role === 'restaurante' ? 'Administrador' : 
                      user?.role === 'empleado' ? 'Empleado' : '';

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="resto-shell">
            <aside className="resto-sidebar">
                <div>
                    <div className="resto-brand">RestoSys</div>
                    <div className="resto-subtitle">
                        {user?.restaurant?.name || "Panel restaurante"}
                        {roleLabel && (
                            <span className="resto-role-badge">
                                {roleLabel}
                            </span>
                        )}
                    </div>
                </div>

                <nav className="resto-nav">
                    <NavLink to="/restaurante/pedidos" className={({ isActive }) => `resto-link ${isActive ? "active" : ""}`}>
                        <i className="fa-solid fa-receipt"></i>Pedidos
                    </NavLink>
                    
                    {/* ✅ Menú SOLO visible para Admin Restaurante */}
                    {user?.role === 'restaurante' && (
                        <NavLink to="/restaurante/menu" className={({ isActive }) => `resto-link ${isActive ? "active" : ""}`}>
                            <i className="fa-solid fa-utensils"></i>Menu
                        </NavLink>
                    )}
                    
                    {/* ✅ Reportes SOLO visible para Admin Restaurante */}
                    {user?.role === 'restaurante' && (
                        <NavLink to="/restaurante/reportes" className={({ isActive }) => `resto-link ${isActive ? "active" : ""}`}>
                            <i className="fa-solid fa-chart-bar"></i>Reportes
                        </NavLink>
                    )}
                    
                    <NavLink to="/restaurante/pagos" className={({ isActive }) => `resto-link ${isActive ? "active" : ""}`}>
                        <i className="fa-solid fa-credit-card"></i>Pagos
                    </NavLink>
                </nav>

                <button type="button" className="resto-link resto-logout" onClick={handleLogout}>
                    <i className="fa-solid fa-door-open"></i>Salir
                </button>
            </aside>

            <div className="resto-main">
                <header className="resto-header">
                    <div>
                        <div className="resto-title">{title}</div>
                        {subtitle && <div className="resto-meta">{subtitle}</div>}
                    </div>
                    <div className="resto-header-actions">
                        {actions}
                        <div className="resto-avatar">{initials || "RS"}</div>
                    </div>
                </header>

                <div className="resto-body">{children}</div>
            </div>

            <style>{`
                .resto-shell {
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 240px 1fr;
                    background: #0f0b0b;
                    color: #f5f2f2;
                }
                .resto-sidebar {
                    background: #151010;
                    border-right: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 24px 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    position: sticky;
                    top: 0;
                    height: 100vh;
                    overflow-y: auto;
                }
                .resto-brand {
                    font-weight: 700;
                    font-size: 1.1rem;
                    letter-spacing: 0.3px;
                }
                .resto-subtitle {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.85rem;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .resto-role-badge {
                    display: inline-block;
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 2px 10px;
                    border-radius: 20px;
                    background: rgba(212, 74, 66, 0.2);
                    color: #d44a42;
                    border: 1px solid rgba(212, 74, 66, 0.3);
                    width: fit-content;
                }
                .resto-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .resto-link {
                    padding: 10px 14px;
                    border-radius: 12px;
                    text-decoration: none;
                    color: rgba(255, 255, 255, 0.75);
                    background: transparent;
                    border: 1px solid transparent;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .resto-link:hover {
                    background: rgba(255, 255, 255, 0.06);
                    color: #fff;
                }
                .resto-link.active {
                    background: #d44a42;
                    color: #fff;
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .resto-logout {
                    margin-top: auto;
                    text-align: left;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }
                .resto-main {
                    padding: 28px 32px 48px;
                }
                .resto-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 28px;
                    gap: 16px;
                }
                .resto-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                }
                .resto-meta {
                    color: rgba(255, 255, 255, 0.55);
                    font-size: 0.9rem;
                }
                .resto-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .resto-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #d44a42;
                    color: #fff;
                    font-weight: 700;
                    display: grid;
                    place-items: center;
                    font-size: 0.85rem;
                }
                .resto-body {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                @media (max-width: 992px) {
                    .resto-shell {
                        grid-template-columns: 1fr;
                    }
                    .resto-sidebar {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                        overflow-x: auto;
                    }
                    .resto-logout {
                        margin-top: 0;
                    }
                }
            `}</style>
        </div>
    );
}