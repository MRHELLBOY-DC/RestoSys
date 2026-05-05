import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useAuth } from "../../hooks/useAuth";

export default function ClienteDashboard() {
    const { user, loading } = useAuth(['cliente']);
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <DashboardNavbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                    <div className="spinner-border text-light me-3" role="status"></div>
                    <span className="h5 mb-0">Cargando panel del cliente...</span>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Configuración de botones principales para renderizado limpio
    const menuActions = [
        { title: "Ver Menú", icon: "", path: "/menu", desc: "Explora nuestros platillos" },
        { title: "Mi Carrito", icon: "", path: "/carrito", desc: "Revisa tu selección" },
        { title: "Mis Pedidos", icon: "", path: "/mis-pedidos", desc: "Estado de tus órdenes" },
    ];

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <DashboardNavbar />
            
            <div className="container py-5 flex-grow-1 d-flex flex-column justify-content-center">
                <div className="text-center text-white mb-5 animate__animated animate__fadeInDown">
                    <h1 className="display-4 fw-bold mb-2">¡Hola, {user.username}!</h1>
                    <p className="lead opacity-75">¿Qué deseas hacer hoy en tu Menú Digital?</p>
                </div>

                <div className="row g-4 justify-content-center">
                    {menuActions.map((action, index) => (
                        <div key={index} className="col-12 col-md-4 col-lg-3">
                            <div 
                                className="card h-100 shadow-lg border-white border-opacity-25 text-white text-center p-3 btn-hover-effect"
                                onClick={() => navigate(action.path)}
                                style={{ 
                                    background: 'rgba(255, 255, 255, 0.1)', 
                                    backdropFilter: 'blur(15px)',
                                    borderRadius: '25px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s ease'
                                }}
                            >
                                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                    <span className="display-4 mb-3">{action.icon}</span>
                                    <h3 className="h5 fw-bold mb-2">{action.title}</h3>
                                    <p className="small text-white-50 mb-0">{action.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Estilos locales para el efecto hover de las tarjetas */}
            <style>{`
                .btn-hover-effect:hover {
                    transform: translateY(-10px);
                    background: rgba(255, 255, 255, 0.2) !important;
                }
            `}</style>
        </div>
    );
}