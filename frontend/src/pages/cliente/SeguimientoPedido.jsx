import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useOrdersSocket } from "../../hooks/useOrdersSocket";
import Navbar from "../../components/Navbar";
import RouteMap from "../../components/RouteMap";
import { getOrdersByClient } from "../../services/ordersApi";
import { getPublicRestaurantes } from "../../services/api";
import "../../styles/client-theme.css";

const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, '0')}`;
const fromUUID = (uuid) => Number(String(uuid).slice(-12));

const STATUS_LABEL = {
    RECIBIDO: 'Recibido',
    PREPARANDO: 'Preparando',
    LISTO: 'Listo',
    EN_CAMINO: 'En camino',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
};

export default function SeguimientoPedido() {
    const { user, loading } = useAuth(['cliente']);
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [pedido, setPedido] = useState(null);
    const [restaurante, setRestaurante] = useState(null);
    const [error, setError] = useState("");
    const [arrivalNotice, setArrivalNotice] = useState(null);

    const fetchPedido = useCallback(async () => {
        if (!user) return;
        try {
            const data = await getOrdersByClient(toUUID(user.id));
            const found = data.find(p => p.id === orderId);
            if (!found) {
                setError("No se encontro el pedido.");
                return;
            }
            setPedido(found);
            setError("");
        } catch {
            setError("No se pudo cargar el pedido.");
        }
    }, [user, orderId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPedido();
    }, [fetchPedido]);

    useEffect(() => {
        if (!pedido) return;
        getPublicRestaurantes()
            .then(list => setRestaurante((list || []).find(r => r.id === fromUUID(pedido.restaurantId)) || null))
            .catch(() => setRestaurante(null));
    }, [pedido]);

    useOrdersSocket({
        enabled: !!user,
        onConnect: fetchPedido,
        onOrderUpdate: (updated) => {
            if (updated.id === orderId) setPedido(updated);
        },
        onNotification: (notification) => {
            if (notification.orderId === orderId) setArrivalNotice(notification);
        },
    });

    if (loading) {
        return (
            <div className="client-shell d-flex flex-column">
                <Navbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                    <div className="spinner-border me-2" style={{ color: '#e4531f' }} role="status"></div>
                    <p className="mb-0 client-muted fw-semibold">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const origin = restaurante?.lat != null && restaurante?.lng != null
        ? { lat: restaurante.lat, lng: restaurante.lng }
        : null;

    return (
        <div className="client-shell d-flex flex-column">
            <Navbar />
            <main className="container py-4 py-lg-5 flex-grow-1">
                <button
                    onClick={() => navigate('/mis-pedidos')}
                    className="btn client-pill px-3 py-2 mb-4 d-inline-flex align-items-center gap-2"
                >
                    <i className="fa fa-arrow-left" />
                    Volver a mis pedidos
                </button>

                {arrivalNotice && (
                    <div
                        className="alert border-0 mb-4 d-flex align-items-center justify-content-between gap-3"
                        style={{ background: '#f1e9fb', color: '#6f42c1', borderRadius: 14 }}
                    >
                        <span><i className="fa-solid fa-bell me-2" />{arrivalNotice.message}</span>
                        <button type="button" className="btn-close" onClick={() => setArrivalNotice(null)} aria-label="Cerrar" />
                    </div>
                )}

                {error && (
                    <div className="alert mb-4" style={{ background: '#fff0ef', border: '1px solid #f5c5c1', color: '#9d221c', borderRadius: 14 }}>
                        {error}
                    </div>
                )}

                {pedido && (
                    <section className="client-hero p-4 p-lg-5">
                        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                            <div>
                                <div className="client-kicker mb-1">Seguimiento en vivo</div>
                                <h1 className="client-title h2 mb-1">{pedido.orderCode}</h1>
                                <p className="client-muted mb-0 small">{pedido.deliveryAddress}</p>
                            </div>
                            <span
                                className="badge rounded-pill px-3 py-2 fw-semibold"
                                style={{ background: pedido.status === 'EN_CAMINO' ? '#6f42c1' : '#20c997' }}
                            >
                                {STATUS_LABEL[pedido.status] || pedido.status}
                            </span>
                        </div>

                        {pedido.status !== 'EN_CAMINO' ? (
                            <p className="client-muted">Este pedido ya no esta en camino.</p>
                        ) : origin && pedido.deliveryLat != null && pedido.deliveryLng != null ? (
                            <RouteMap
                                origin={origin}
                                destination={{ lat: pedido.deliveryLat, lng: pedido.deliveryLng }}
                                originLabel="Restaurante"
                                destinationLabel="Tu direccion"
                            />
                        ) : (
                            <p className="client-muted">No hay coordenadas suficientes para trazar la ruta.</p>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}
