import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useOrdersSocket } from "../../hooks/useOrdersSocket";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getOrdersByClient } from "../../services/ordersApi";
import { getPaymentByOrder, getReceiptUrl, downloadReceiptPdf } from "../../services/paymentsApi";
import "../../styles/client-theme.css";

const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, '0')}`;

const STATUS_COLOR = {
    RECIBIDO: '#17a2b8',
    PREPARANDO: '#fd7e14',
    LISTO: '#28a745',
    EN_CAMINO: '#6f42c1',
    ENTREGADO: '#20c997',
    CANCELADO: '#dc3545',
};

const STATUS_LABEL = {
    RECIBIDO: 'Recibido',
    PREPARANDO: 'Preparando',
    LISTO: 'Listo',
    EN_CAMINO: 'En camino',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
};

const ORDER_TYPE_LABEL = { MESA: 'En mesa', PICKUP: 'Para llevar', DELIVERY: 'Delivery' };
const PAYMENT_STATUS_LABEL = { PENDIENTE: 'Pendiente', PAGADO: 'Pagado' };
const PAGE_SIZE = 6;

export default function MisPedidos() {
    const { user, loading } = useAuth(['cliente']);
    const [pedidos, setPedidos] = useState([]);
    const [payments, setPayments] = useState({});
    const [noPaymentIds] = useState(() => new Set());
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [arrivalNotice, setArrivalNotice] = useState(null);
    const navigate = useNavigate();

    const totalPages = Math.max(1, Math.ceil(pedidos.length / PAGE_SIZE));
    const pageStart = (currentPage - 1) * PAGE_SIZE;
    const pedidosPagina = pedidos.slice(pageStart, pageStart + PAGE_SIZE);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    const fetchPedidos = useCallback(async () => {
        if (!user) return;
        setFetching(true);
        try {
            const data = await getOrdersByClient(toUUID(user.id));
            setPedidos(data);
            setError(null);
            const paymentMap = { ...payments };
            await Promise.allSettled(
                data
                    .filter((pedido) => !noPaymentIds.has(pedido.id))
                    .map(async (pedido) => {
                        try {
                            const p = await getPaymentByOrder(pedido.id);
                            paymentMap[pedido.id] = p;
                        } catch (e) {
                            if (e?.status === 404) noPaymentIds.add(pedido.id);
                        }
                    })
            );
            setPayments(paymentMap);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('No se pudieron cargar los pedidos.');
        } finally {
            setFetching(false);
        }
    }, [user]);

    const applyOrderUpdate = useCallback((updatedOrder) => {
        setPedidos(prev => {
            const idx = prev.findIndex(p => p.id === updatedOrder.id);
            if (idx === -1) return [updatedOrder, ...prev];
            const copy = [...prev];
            copy[idx] = updatedOrder;
            return copy;
        });
        if (updatedOrder.paymentStatus === 'PAGADO' && !noPaymentIds.has(updatedOrder.id)) {
            getPaymentByOrder(updatedOrder.id)
                .then(p => setPayments(prev => ({ ...prev, [updatedOrder.id]: p })))
                .catch((e) => { if (e?.status === 404) noPaymentIds.add(updatedOrder.id); });
        }
    }, [noPaymentIds]);

    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    // Actualizaciones en tiempo real por WebSocket en vez de re-consultar la API cada pocos segundos.
    useOrdersSocket({
        enabled: !!user,
        onConnect: fetchPedidos,
        onOrderUpdate: applyOrderUpdate,
        onNotification: (notification) => setArrivalNotice(notification),
    });

    if (loading) {
        return (
            <div className="client-shell d-flex flex-column">
                <Navbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                    <div className="spinner-border me-2" style={{ color: '#e4531f' }} role="status"></div>
                    <p className="mb-0 client-muted fw-semibold">Cargando tus pedidos...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="client-shell d-flex flex-column">
            <Navbar />
            <main className="container py-4 py-lg-5 flex-grow-1">
                <section className="client-hero p-4 p-lg-5 mb-4">
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                        <div>
                            <div className="client-kicker mb-1">Seguimiento</div>
                            <h1 className="client-title h2 mb-1">Mis pedidos</h1>
                            <p className="client-muted mb-0 small">Se actualiza en tiempo real.</p>
                        </div>
                        <button
                            className="btn client-button px-4 py-3 d-inline-flex align-items-center gap-2"
                            style={{ background: '#e4531f', color: '#fff', border: 'none' }}
                            onClick={fetchPedidos}
                            disabled={fetching}
                        >
                            {fetching ? <span className="spinner-border spinner-border-sm" role="status" /> : <i className="fa fa-rotate-right" />}
                            Actualizar
                        </button>
                    </div>
                </section>

                {arrivalNotice && (
                    <div
                        className="alert border-0 mb-4 d-flex align-items-center justify-content-between gap-3"
                        style={{ background: '#f1e9fb', color: '#6f42c1', borderRadius: 14 }}
                    >
                        <span><i className="fa-solid fa-bell me-2" />{arrivalNotice.message} ({arrivalNotice.orderCode})</span>
                        <button type="button" className="btn-close" onClick={() => setArrivalNotice(null)} aria-label="Cerrar" />
                    </div>
                )}

                {error && (
                    <div className="alert mb-4" style={{ background: '#fff0ef', border: '1px solid #f5c5c1', color: '#9d221c', borderRadius: 14 }}>
                        {error}
                    </div>
                )}

                {pedidos.length === 0 && !fetching ? (
                    <section className="client-empty text-center py-5 px-4">
                        <span className="client-icon-box fs-2 mb-3">
                            <i className="fa fa-receipt" />
                        </span>
                        <h2 className="client-title h3 mb-2">No tienes pedidos realizados aun</h2>
                        <p className="client-muted mb-4">Cuando confirmes un pedido, lo veras aqui con su estado.</p>
                        <button onClick={() => navigate('/cliente/dashboard')} className="btn client-button px-5 py-3" style={{ background: '#e4531f', color: '#fff', border: 'none' }}>
                            Ver restaurantes
                        </button>
                    </section>
                ) : (
                    <div className="row g-4">
                        {pedidosPagina.map(pedido => (
                            <div key={pedido.id} className="col-12 col-md-6 col-lg-4">
                                <article className="client-card h-100 p-4">
                                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                                        <div>
                                            <span className="client-kicker d-block mb-1">Pedido</span>
                                            <span className="fw-bold fs-5" style={{ color: '#e4531f' }}>{pedido.orderCode}</span>
                                        </div>
                                        <span className="badge rounded-pill px-3 py-2 small fw-semibold" style={{ background: STATUS_COLOR[pedido.status] || '#6c757d' }}>
                                            {STATUS_LABEL[pedido.status] || pedido.status}
                                        </span>
                                    </div>

                                    <div className="d-flex justify-content-between mb-2 small">
                                        <span className="client-muted">Tipo</span>
                                        <span className="fw-semibold">{ORDER_TYPE_LABEL[pedido.type] || pedido.type}</span>
                                    </div>
                                    {pedido.tableNumber && (
                                        <div className="d-flex justify-content-between mb-2 small">
                                            <span className="client-muted">Mesa</span>
                                            <span className="fw-semibold">{pedido.tableNumber}</span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between mb-2 small">
                                        <span className="client-muted">Pago</span>
                                        <span className="fw-semibold" style={{ color: pedido.paymentStatus === 'PAGADO' ? '#2e7d5b' : '#b7791f' }}>
                                            {PAYMENT_STATUS_LABEL[pedido.paymentStatus] || pedido.paymentStatus}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3 small">
                                        <span className="client-muted">Fecha</span>
                                        <span className="fw-semibold text-end">{new Date(pedido.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                    </div>

                                    <hr style={{ borderColor: '#ebe1d5', opacity: 1 }} />

                                    <div className="mb-3">
                                        <p className="client-kicker mb-2">Productos</p>
                                        {pedido.items?.map(item => (
                                            <div key={item.id} className="d-flex justify-content-between gap-3 small mb-1">
                                                <span>{item.quantity}x {item.productName}</span>
                                                <span className="fw-semibold text-nowrap">Bs {Number(item.subtotal).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {pedido.type === 'DELIVERY' && (
                                        <div className="d-flex justify-content-between mb-2 small">
                                            <span className="client-muted">Direccion</span>
                                            <span className="fw-semibold text-end">{pedido.deliveryAddress || '-'}</span>
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-between align-items-center fw-bold pt-2">
                                        <span>Total</span>
                                        <span className="h5 mb-0" style={{ color: '#e4531f' }}>Bs {Number(pedido.totalAmount).toFixed(2)}</span>
                                    </div>

                                    {pedido.type === 'DELIVERY' && pedido.status === 'EN_CAMINO' && (
                                        <button
                                            onClick={() => navigate(`/mis-pedidos/${pedido.id}/ruta`)}
                                            className="btn w-100 mt-3 fw-semibold small"
                                            style={{ background: '#f1e9fb', border: '1px solid #d9c6f2', color: '#6f42c1', borderRadius: 12 }}
                                        >
                                            <i className="fa fa-route me-2" />
                                            Ver ruta en vivo
                                        </button>
                                    )}

                                    {payments[pedido.id]?.receipt && (
                                        <div className="d-flex gap-2 mt-3">
                                            <button
                                                onClick={() => getReceiptUrl(payments[pedido.id].id)}
                                                className="btn flex-fill fw-semibold small"
                                                style={{ background: '#eaf3ee', border: '1px solid #b9dcc9', color: '#2e7d5b', borderRadius: 12 }}
                                            >
                                                <i className="fa fa-file-invoice me-2" />
                                                Ver comprobante
                                            </button>
                                            <button
                                                onClick={() => downloadReceiptPdf(payments[pedido.id].id)}
                                                className="btn flex-fill fw-semibold small"
                                                style={{ background: '#ffeee4', border: '1px solid #f0d8c8', color: '#c23d12', borderRadius: 12 }}
                                            >
                                                <i className="fa fa-download me-2" />
                                                Descargar PDF
                                            </button>
                                        </div>
                                    )}
                                </article>
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <nav className="d-flex flex-wrap justify-content-center align-items-center gap-2 mt-5">
                        <button
                            className="btn client-pill px-3 py-2 d-inline-flex align-items-center"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            aria-label="Página anterior"
                        >
                            <i className="fa fa-chevron-left" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`btn client-pill px-3 py-2 fw-semibold ${page === currentPage ? 'client-pill-active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="btn client-pill px-3 py-2 d-inline-flex align-items-center"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            aria-label="Página siguiente"
                        >
                            <i className="fa fa-chevron-right" />
                        </button>
                    </nav>
                )}
            </main>
        </div>
    );
}