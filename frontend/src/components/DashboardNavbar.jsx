import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/api";

export default function DashboardNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const user = getCurrentUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getIconByRole = () => {
        switch (user?.role) {
            case 'admin': return '';
            case 'restaurante': return '';
            case 'cliente': return '';
            default: return '';
        }
    };

    const getRoleName = () => {
        switch (user?.role) {
            case 'admin': return 'Administrador';
            case 'restaurante': return 'Restaurante';
            case 'cliente': return 'Cliente';
            default: return '';
        }
    };

    if (!user) return null;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-black bg-opacity-25 border-bottom border-white border-opacity-10 shadow-sm sticky-top"
             style={{ backdropFilter: 'blur(10px)' }}>
            <div className="container">
                {/* Logo */}
                <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
                    <span className="fs-4"></span>
                    <span>MenuDigital</span>
                </Link>

                {/* Menú de Usuario */}
                <div className="ms-auto position-relative">
                    <button 
                        className="btn btn-outline-light border-white border-opacity-25 rounded-pill d-flex align-items-center gap-2 px-3 py-1"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className="fs-5">{getIconByRole()}</span>
                        <span className="d-none d-sm-inline fw-medium">{user.username}</span>
                        <small className={isOpen ? "rotate-180 transition-all" : "transition-all"}>▼</small>
                    </button>

                    {/* Dropdown Personalizado con Bootstrap Classes */}
                    {isOpen && (
                        <div className="position-absolute end-0 mt-2 shadow-lg animate__animated animate__fadeInDown animate__faster" 
                             style={{ 
                                minWidth: '220px', 
                                zIndex: 1050,
                                background: 'white',
                                borderRadius: '15px',
                                overflow: 'hidden'
                             }}>
                            
                            <div className="p-3 bg-light d-flex align-items-center gap-3">
                                <div className="fs-2">{getIconByRole()}</div>
                                <div>
                                    <p className="mb-0 fw-bold text-dark">{user.username}</p>
                                    <p className="mb-0 small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                                        {getRoleName()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="border-top border-light"></div>
                            
                            <button 
                                onClick={handleLogout} 
                                className="dropdown-item py-3 text-danger d-flex align-items-center gap-2"
                            >
                                <span></span> Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay para cerrar al hacer clic fuera (mantenemos lógica simple) */}
            {isOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100" 
                    style={{ zIndex: 1040 }} 
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </nav>
    );
}