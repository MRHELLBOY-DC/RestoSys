import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useAuth } from "../../hooks/useAuth";

export default function AdminDashboard() {
    const { user, loading } = useAuth(['admin']);
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="min-vh-100 w-100 d-flex align-items-center justify-content-center text-white"
                 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="text-center">
                    <div className="spinner-border mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="h5">Cargando panel de administración...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const displayName = user.full_name?.trim() || user.username || user.email || "";

    return (
        <div className="min-vh-100 w-100 d-flex flex-column" 
             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            
            <DashboardNavbar />
            
            <main className="container py-5 flex-grow-1">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10">
                        {/* Encabezado */}
                        <div className="text-white mb-5 animate__animated animate__fadeIn">
                            <h1 className="display-5 fw-bold">Panel de Administración</h1>
                            <p className="lead text-white-50">Bienvenido, {displayName}. Gestiona la plataforma desde aquí.</p>
                        </div>

                        {/* Acciones en Grid de Bootstrap */}
                        <div className="row g-4">
                            <div className="col-12 col-md-4">
                                <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 text-white shadow-sm transition-hover"
                                     style={{ backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                                    <div className="card-body p-4 text-center d-flex flex-column">
                                        <div className="display-6 mb-3"></div>
                                        <h3 className="h5 mb-3">Restaurantes</h3>
                                        <p className="small text-white-50 flex-grow-1">Registra, edita o elimina establecimientos de la red.</p>
                                        <button 
                                            className="btn btn-light w-100 mt-3 fw-bold"
                                            onClick={() => navigate("/admin/restaurantes")}
                                        >
                                            Gestionar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 text-white shadow-sm transition-hover"
                                     style={{ backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                                    <div className="card-body p-4 text-center d-flex flex-column">
                                        <div className="display-6 mb-3"></div>
                                        <h3 className="h5 mb-3">Usuarios</h3>
                                        <p className="small text-white-50 flex-grow-1">Control de roles y cuentas de clientes y dueños.</p>
                                        <button 
                                            className="btn btn-light w-100 mt-3 fw-bold"
                                            onClick={() => navigate("/admin/usuarios")}
                                        >
                                            Gestionar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 text-white shadow-sm transition-hover"
                                     style={{ backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                                    <div className="card-body p-4 text-center d-flex flex-column">
                                        <div className="display-6 mb-3"></div>
                                        <h3 className="h5 mb-3">Reportes</h3>
                                        <p className="small text-white-50 flex-grow-1">Visualiza estadísticas y rendimiento global.</p>
                                        <button 
                                            className="btn btn-light w-100 mt-3 fw-bold"
                                            onClick={() => navigate("/admin/reportes")}
                                        >
                                            Ver Reportes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
