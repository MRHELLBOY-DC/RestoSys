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

    // Verificar si estamos en login o register
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

    return (
        <nav className="navbar navbar-expand-lg navbar-dark landing-nav py-0">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img src="/restosyslogo.png" alt="RestoSys" style={{ width: '160px', objectFit: 'contain', mixBlendMode: 'screen' }} />
                </Link>

                {/* Mostrar enlaces SOLO cuando NO hay usuario logueado Y NO estamos en login/register */}
                {!user && !isAuthPage && (
                    <div className="d-none d-lg-flex gap-4 text-white-50">
                        <a href="#funciones" className="nav-link">Funciones</a>
                        <a href="#como-funciona" className="nav-link">Cómo funciona</a>
                    </div>
                )}

                <div className="d-flex gap-2 align-items-center">
                    {user ? (
                        <>
                            <Link to={getDashboardPath()} className="btn btn-outline-light rounded-pill px-3">
                                Mi panel
                            </Link>
                            <button
                                type="button"
                                className="btn btn-primary rounded-pill px-4 landing-cta"
                                onClick={handleLogout}
                            >
                                Salir
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline-light rounded-pill px-3">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary rounded-pill px-4 landing-cta">
                                Empezar →
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .landing-nav {
                    background: rgba(5, 5, 5, 0.6);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(12px);
                }
                .landing-nav .nav-link {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    font-weight: 500;
                }
                .landing-nav .nav-link:hover {
                    color: #f0554d;
                }
                .landing-cta {
                    background: linear-gradient(135deg, #f0554d 0%, #d73a35 100%);
                    border: none;
                }
            `}</style>
        </nav>
    );
}