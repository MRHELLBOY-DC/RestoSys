import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../../components/DashboardNavbar";

export default function MisPedidos() {
    const { user, loading } = useAuth(['cliente']);
    const [pedidos, setPedidos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
            
            // TODO: Conectar con el API de pedidos (Microservicio 3)
            // Por ahora, datos de ejemplo o vacío
            setPedidos([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getEstadoColor = (estado) => {
        const colores = {
            'pendiente': '#ffc107',
            'recibido': '#17a2b8',
            'preparando': '#fd7e14',
            'listo': '#28a745',
            'entregado': '#20c997',
            'cancelado': '#dc3545'
        };
        return colores[estado?.toLowerCase()] || '#6c757d';
    };

    const getEstadoNombre = (estado) => {
        const nombres = {
            'pendiente': 'Pendiente',
            'recibido': 'Recibido',
            'preparando': 'Preparando',
            'listo': 'Listo',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        };
        return nombres[estado?.toLowerCase()] || estado || 'Desconocido';
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <DashboardNavbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                    <div className="spinner-border text-light me-2" role="status"></div>
                    <p className="mb-0">Cargando tus pedidos...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <DashboardNavbar />
            <div className="container py-5">
                <div className="text-white mb-5">
                    <h1 className="fw-bold">Mis Pedidos</h1>
                </div>
                
                {pedidos.length === 0 ? (
                    <div className="card border-0 shadow-lg p-5 text-center bg-white bg-opacity-10 text-white" style={{ backdropFilter: 'blur(10px)', borderRadius: '20px' }}>
                        <p className="fs-4">No tienes pedidos realizados</p>
                        <button onClick={() => navigate("/menu")} className="btn btn-light rounded-pill mt-3 px-4 fw-bold">
                            Ver Menú
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {pedidos.map(pedido => (
                            <div key={pedido.id} className="col-12 col-md-6 col-lg-4">
                                <div className="card h-100 border-0 shadow-lg text-dark" style={{ borderRadius: '15px' }}>
                                    <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-4 px-4">
                                        <div className="pedido-id">
                                            <span className="text-muted small d-block">Pedido #</span>
                                            <span className="fw-bold fs-5">{pedido.id}</span>
                                        </div>
                                        <div 
                                            className="badge rounded-pill px-3 py-2"
                                            style={{ backgroundColor: getEstadoColor(pedido.estado) }}
                                        >
                                            {getEstadoNombre(pedido.estado)}
                                        </div>
                                    </div>
                                    <div className="card-body px-4">
                                        <div className="mb-2 d-flex justify-content-between">
                                            <span className="text-muted">Fecha:</span>
                                            <span className="fw-semibold">{pedido.fecha}</span>
                                        </div>
                                        <div className="mb-2 d-flex justify-content-between">
                                            <span className="text-muted">Total:</span>
                                            <span className="fw-bold text-primary">${pedido.total}</span>
                                        </div>
                                        <div className="mb-2 d-flex justify-content-between">
                                            <span className="text-muted">Productos:</span>
                                            <span>{pedido.items || 0} artículos</span>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-transparent border-0 pb-4 px-4">
                                        <button 
                                            className="btn btn-outline-primary w-100 rounded-pill fw-bold"
                                            onClick={() => alert(`Detalles del pedido #${pedido.id} - Próximamente`)}
                                        >
                                            Ver Detalle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}