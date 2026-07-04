import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout } from "../services/api";

export default function Navbar() {
    const user = getCurrentUser();
    const navigate = useNavigate();
    const location = useLocation();
    const displayName = user?.full_name?.trim() || user?.username || user?.email || "";

    const getDashboardPath = () => {
        if (!user) return "/";
        if (user.role === "admin") return "/admin/dashboard";
        if (user.role === "restaurante" || user.role === "empleado") return "/restaurante/dashboard";
        return "/cliente/dashboard";
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

    return (
        <nav className="navbar navbar-expand-lg app-nav py-2">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center gap-2" to={user ? getDashboardPath() : "/"}>
                    <span className="app-nav-badge">R</span>
                    <span className="app-nav-word">RestoSys</span>
                </Link>

                {!user && !isAuthPage && (
                    <div className="d-none d-lg-flex gap-4">
                        <a href="/#funciones" className="app-nav-link">Funciones</a>
                        <a href="/#como-funciona" className="app-nav-link">Cómo funciona</a>
                    </div>
                )}

                <div className="d-flex gap-2 align-items-center">
                    {user ? (
                        <>
                            {displayName && (
                                <span className="app-nav-greeting d-none d-md-inline">Hola, {displayName}</span>
                            )}
                            <Link to={getDashboardPath()} className="btn app-nav-btn rounded-pill px-3">
                                Mi panel
                            </Link>
                            <button
                                type="button"
                                className="btn app-nav-btn rounded-pill px-4"
                                onClick={handleLogout}
                            >
                                Salir
                            </button>
                        </>
                    ) : isAuthPage ? (
                        <Link to="/" className="btn app-nav-btn-outline rounded-pill px-3">
                            <i className="fa-solid fa-arrow-left me-2"></i>
                            Volver al inicio
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn app-nav-btn-outline rounded-pill px-3">
                                Login
                            </Link>
                            <Link to="/register" className="btn app-nav-btn rounded-pill px-4">
                                Empezar →
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .app-nav {
                    background: #ffffff;
                    border-bottom: 1px solid #ebe1d5;
                }
                .app-nav-badge {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    background: #e4531f;
                    color: #ffffff;
                    font-weight: 800;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }
                .app-nav-word {
                    color: #211a15;
                    font-weight: 800;
                    font-size: 19px;
                    letter-spacing: -0.01em;
                }
                .app-nav-link {
                    color: #8c8178;
                    text-decoration: none;
                    font-weight: 600;
                }
                .app-nav-link:hover {
                    color: #e4531f;
                }
                .app-nav-greeting {
                    color: #8c8178;
                    font-weight: 600;
                    font-size: 14px;
                    margin-right: 4px;
                }
                .app-nav-btn {
                    background: #e4531f;
                    color: #ffffff;
                    border: none;
                    font-weight: 700;
                }
                .app-nav-btn:hover {
                    background: #c23d12;
                    color: #ffffff;
                }
                .app-nav-btn-outline {
                    color: #211a15;
                    border: 1.5px solid #ebe1d5;
                    font-weight: 700;
                }
                .app-nav-btn-outline:hover {
                    border-color: #e4531f;
                    color: #e4531f;
                }
            `}</style>
        </nav>
    );
}
