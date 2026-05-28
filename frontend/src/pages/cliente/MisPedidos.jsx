import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getOrdersByClient } from "../../services/ordersApi";
import { getPaymentByOrder, getReceiptUrl } from "../../services/paymentsApi";

const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, '0')}`;

const STATUS_COLOR = {
    RECIBIDO:   '#17a2b8',
    PREPARANDO: '#fd7e14',
    LISTO:      '#28a745',
    ENTREGADO:  '#20c997',
    CANCELADO:  '#dc3545',
};

const STATUS_LABEL = {
    RECIBIDO:   'Recibido',
    PREPARANDO: 'Preparando',
    LISTO:      'Listo',
    ENTREGADO:  'Entregado',
    CANCELADO:  'Cancelado',
};

const ORDER_TYPE_LABEL = { MESA: 'En mesa', PICKUP: 'Para llevar' };
const PAYMENT_STATUS_LABEL = { PENDIENTE: 'Pendiente', PAGADO: 'Pagado' };

export default function MisPedidos() {
    const { user, loading } = useAuth(['cliente']);
    const [pedidos, setPedidos] = useState([]);
    const [payments, setPayments] = useState({});
    const [noPaymentIds] = useState(() => new Set());
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchPedidos = useCallback(async () => {
        if (!user) return;
        setFetching(true);
        try {
            const data = await getOrdersByClient(toUUID(user.id));
            setPedidos(data);
            setError(null);
            // fetch payments for each order — skip IDs already known to have none
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

    useEffect(() => {
        fetchPedidos();
        const interval = setInterval(fetchPedidos, 15000);
        return () => clearInterval(interval);
    }, [fetchPedidos]);

    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
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
        <div className="min-vh-100 d-flex flex-column" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
            <DashboardNavbar />
            <div className="container py-5">
                <div className="text-white mb-4 d-flex align-items-center justify-content-between">
                    <div>
                        <h1 className="fw-bold mb-1">Mis Pedidos</h1>
                        <p className="opacity-75 mb-0 small">Se actualiza automáticamente cada 15 segundos</p>
                    </div>
                    <button
                        className="btn btn-sm text-white fw-semibold"
                        style={{ background: 'rgba(240,85,77,0.2)', border: '1px solid rgba(240,85,77,0.4)', borderRadius: '10px' }}
                        onClick={fetchPedidos}
                        disabled={fetching}
                    >
                        {fetching ? <span className="spinner-border spinner-border-sm me-1" role="status" /> : <i className="fa fa-rotate-right me-1" />}
                        Actualizar
                    </button>
                </div>

                {error && (
                    <div className="alert text-white mb-4" style={{ background: 'rgba(220,53,69,0.2)', border: '1px solid rgba(220,53,69,0.4)', borderRadius: '12px' }}>
                        {error}
                    </div>
                )}

                {pedidos.length === 0 && !fetching ? (
                    <div className="card border-0 p-5 text-center text-white" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', borderRadius: '20px' }}>
                        <i className="fa fa-receipt display-3 mb-3 opacity-50" />
                        <p className="fs-5 mb-3">No tienes pedidos realizados aún</p>
                        <button onClick={() => navigate("/cliente/dashboard")} className="btn text-white rounded-pill px-4 fw-bold" style={{ background: 'linear-gradient(135deg, #f0554d 0%, #d73a35 100%)' }}>
                            Ver Restaurantes
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {pedidos.map(pedido => (
                            <div key={pedido.id} className="col-12 col-md-6 col-lg-4">
                                <div className="card h-100 text-white" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px' }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <span className="small opacity-50 d-block">Pedido</span>
                                                <span className="fw-bold fs-6" style={{ color: '#f0554d' }}>{pedido.orderCode}</span>
                                            </div>
                                            <span
                                                className="badge rounded-pill px-3 py-2 small fw-semibold"
                                                style={{ background: STATUS_COLOR[pedido.status] || '#6c757d' }}
                                            >
                                                {STATUS_LABEL[pedido.status] || pedido.status}
                                            </span>
                                        </div>

                                        <div className="d-flex justify-content-between mb-2 small">
                                            <span className="opacity-60">Tipo</span>
                                            <span>{ORDER_TYPE_LABEL[pedido.type] || pedido.type}</span>
                                        </div>
                                        {pedido.tableNumber && (
                                            <div className="d-flex justify-content-between mb-2 small">
                                                <span className="opacity-60">Mesa</span>
                                                <span>{pedido.tableNumber}</span>
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between mb-2 small">
                                            <span className="opacity-60">Pago</span>
                                            <span style={{ color: pedido.paymentStatus === 'PAGADO' ? '#28a745' : '#ffc107' }}>
                                                {PAYMENT_STATUS_LABEL[pedido.paymentStatus] || pedido.paymentStatus}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3 small">
                                            <span className="opacity-60">Fecha</span>
                                            <span>{new Date(pedido.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                        </div>

                                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                                        <div className="mb-3">
                                            <p className="small opacity-60 mb-2">Productos</p>
                                            {pedido.items?.map(item => (
                                                <div key={item.id} className="d-flex justify-content-between small mb-1">
                                                    <span>{item.quantity}× {item.productName}</span>
                                                    <span>${Number(item.subtotal).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="d-flex justify-content-between fw-bold">
                                            <span>Total</span>
                                            <span style={{ color: '#f0554d' }}>${Number(pedido.totalAmount).toFixed(2)}</span>
                                        </div>

                                        {payments[pedido.id]?.receipt && (
                                            <button
                                                onClick={() => getReceiptUrl(payments[pedido.id].id)}
                                                className="btn w-100 fw-semibold mt-3 small"
                                                style={{ background: 'rgba(40,167,69,0.15)', border: '1px solid rgba(40,167,69,0.4)', color: '#5cb85c', borderRadius: '10px' }}
                                            >
                                                <i className="fa fa-file-invoice me-2" />
                                                Ver Comprobante
                                            </button>
                                        )}
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
