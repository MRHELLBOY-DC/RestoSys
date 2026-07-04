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
                    
                    {/* Menú SOLO visible para Admin Restaurante */}
                    {user?.role === 'restaurante' && (
                        <NavLink to="/restaurante/menu" className={({ isActive }) => `resto-link ${isActive ? "active" : ""}`}>
                            <i className="fa-solid fa-utensils"></i>Menu
                        </NavLink>
                    )}
                    
                    {/*Reportes SOLO visible para Admin Restaurante */}
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
                    background: #faf5ee;
                    color: #211a15;
                }
                .resto-sidebar {
                    background: #ffffff;
                    border-right: 1px solid #ebe1d5;
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
                    font-weight: 800;
                    font-size: 1.1rem;
                    letter-spacing: 0.3px;
                    color: #211a15;
                }
                .resto-subtitle {
                    color: #8c8178;
                    font-size: 0.85rem;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .resto-role-badge {
                    display: inline-block;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 2px 10px;
                    border-radius: 20px;
                    background: #ffeee4;
                    color: #c23d12;
                    border: 1px solid #f0d8c8;
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
                    color: #211a15;
                    background: transparent;
                    border: 1px solid transparent;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                }
                .resto-link:hover {
                    background: #f3ebe0;
                    color: #211a15;
                }
                .resto-link.active {
                    background: #e4531f;
                    color: #ffffff;
                    border-color: #e4531f;
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
                    font-weight: 800;
                    color: #211a15;
                }
                .resto-meta {
                    color: #8c8178;
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
                    background: #e4531f;
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