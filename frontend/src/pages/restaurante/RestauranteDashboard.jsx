import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useAuth } from "../../hooks/useAuth";

export default function RestauranteDashboard() {
    const { user, loading } = useAuth(['restaurante']);
    const navigate = useNavigate();
    

    // Degradado personalizado para identificar el panel administrativo
    const adminGradient = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';


    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: adminGradient }}>
                <DashboardNavbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                    <div className="spinner-border text-light me-2" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando panel administrativo...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: adminGradient }}>
            <DashboardNavbar />
            
            <div className="container py-5">
                {/* Cabecera del Panel con animación */}
                <div className="text-white mb-5 animate__animated animate__fadeInDown">
                    <h1 className="display-4 fw-bold mb-1">Panel del Restaurante</h1>
                    <div className="d-inline-flex align-items-center bg-white bg-opacity-10 px-3 py-2 rounded-pill border border-white border-opacity-25">
                        <span className="fs-5">{user.restaurant?.name || 'Establecimiento No Asignado'}</span>
                    </div>
                </div>

                {/* QR de mesa */}
                {user.restaurant?.id && (
                    <div className="card border-0 shadow-lg text-white mb-5"
                         style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', borderRadius: '20px' }}>
                        <div className="card-body p-4 d-flex flex-column align-items-center gap-3">
                            <h2 className="fw-bold h5 mb-0">Menú Digital</h2>
                            <div className="p-3 rounded-3 bg-white">
                                <QRCodeSVG
                                    value={`${window.location.origin}/restaurante/${user.restaurant.id}/menu`}
                                    size={160}
                                    bgColor="#ffffff"
                                    fgColor="#111111"
                                    level="M"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Acciones Principales en Grid */}
                <div className="row g-4">
                    {/* Gestionar Productos */}
                    <div className="col-12 col-md-6">
                        <div 
                            className="card border-0 shadow-lg h-100 text-white p-4"
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.15)', 
                                backdropFilter: 'blur(12px)', 
                                borderRadius: '25px', 
                                cursor: 'pointer', 
                                transition: 'all 0.3s ease' 
                            }}
                            onClick={() => navigate("/restaurante/menu")}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            }}
                        >
                            <div className="card-body d-flex align-items-center">
                                <div className="display-3 me-4 shadow-sm"></div>
                                <div>
                                    <h3 className="fw-bold mb-1">Gestionar Productos</h3>
                                    <p className="mb-0 opacity-75">Actualiza tu menú, precios y categorías en tiempo real.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pedidos Activos */}
                    <div className="col-12 col-md-6">
                        <div 
                            className="card border-0 shadow-lg h-100 text-white p-4"
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.15)', 
                                backdropFilter: 'blur(12px)', 
                                borderRadius: '25px', 
                                cursor: 'pointer', 
                                transition: 'all 0.3s ease' 
                            }}
                            onClick={() => navigate("/restaurante/pedidos")}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            }}
                        >
                            <div className="card-body d-flex align-items-center">
                                <div className="display-3 me-4 shadow-sm"></div>
                                <div>
                                    <h3 className="fw-bold mb-1">Pedidos Activos</h3>
                                    <p className="mb-0 opacity-75">Monitorea y despacha las órdenes entrantes.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pagos y Facturacion */}
                    <div className="col-12 col-md-6">
                        <div 
                            className="card border-0 shadow-lg h-100 text-white p-4"
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.15)', 
                                backdropFilter: 'blur(12px)', 
                                borderRadius: '25px', 
                                cursor: 'pointer', 
                                transition: 'all 0.3s ease' 
                            }}
                            onClick={() => navigate("/restaurante/pagos")}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            }}
                        >
                            <div className="card-body d-flex align-items-center">
                                <div className="display-3 me-4 shadow-sm"></div>
                                <div>
                                    <h3 className="fw-bold mb-1">Pagos y Facturacion</h3>
                                    <p className="mb-0 opacity-75">Prueba pagos en caja, QR simulado y comprobantes.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reportes */}
                    <div className="col-12 col-md-6">
                        <div 
                            className="card border-0 shadow-lg h-100 text-white p-4"
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.15)', 
                                backdropFilter: 'blur(12px)', 
                                borderRadius: '25px', 
                                cursor: 'pointer', 
                                transition: 'all 0.3s ease' 
                            }}
                            onClick={() => navigate("/restaurante/reportes")}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            }}
                        >
                            <div className="card-body d-flex align-items-center">
                                <div className="display-3 me-4 shadow-sm"></div>
                                <div>
                                    <h3 className="fw-bold mb-1">Reportes</h3>
                                    <p className="mb-0 opacity-75">Analiza métricas de rendimiento y crecimiento.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
