import { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useAuth } from "../../hooks/useAuth";
import { changeOrderStatus, listActiveOrders, listOrderHistory } from "../../services/ordersApi";
import { confirmCashPayment, getPaymentByOrder, getReceiptUrl } from "../../services/paymentsApi";

const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, '0')}`;

const STATUS_FLOW = ["RECIBIDO", "PREPARANDO", "LISTO", "ENTREGADO"];

const STATUS_LABEL = {
    RECIBIDO: "Recibido",
    PREPARANDO: "Preparando",
    LISTO: "Listo",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
};

const getNextStatus = (status) => {
    const index = STATUS_FLOW.indexOf(status);
    if (index === -1 || index === STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[index + 1];
};

const formatAmount = (value) => {
    if (value === null || value === undefined) return "0.00";
    const number = Number(value);
    if (Number.isNaN(number)) return "0.00";
    return number.toFixed(2);
};

export default function RestaurantePedidos() {
    const { user, loading } = useAuth(["restaurante"]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const restaurantId = useMemo(() => {
        return user?.restaurant?.id || user?.restaurant_id || "";
    }, [user]);

    const adminGradient = "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)";

    const loadActiveOrders = async () => {
        if (!restaurantId) return;
        setBusy(true);
        setError("");
        try {
            const data = await listActiveOrders(toUUID(restaurantId));
            setActiveOrders(data);
        } catch (err) {
            setError(err?.message || "No se pudieron cargar los pedidos activos");
        } finally {
            setBusy(false);
        }
    };

    const loadHistoryOrders = async () => {
        if (!restaurantId) return;
        setBusy(true);
        setError("");
        try {
            const data = await listOrderHistory(toUUID(restaurantId));
            setHistoryOrders(data);
        } catch (err) {
            setError(err?.message || "No se pudo cargar el historial");
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        if (restaurantId) {
            loadActiveOrders();
            loadHistoryOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId]);

    const handleAdvanceStatus = async (orderId, currentStatus) => {
        const nextStatus = getNextStatus(currentStatus);
        if (!nextStatus) return;
        setBusy(true);
        setError("");
        try {
            await changeOrderStatus(orderId, nextStatus);
            await loadActiveOrders();
        } catch (err) {
            setError(err?.message || "No se pudo cambiar el estado");
        } finally {
            setBusy(false);
        }
    };

    const handleConfirmPayment = async (orderId) => {
        setBusy(true);
        setError("");
        try {
            const payment = await getPaymentByOrder(orderId);
            await confirmCashPayment(payment.id);
            await loadActiveOrders();
        } catch (err) {
            if (err?.status === 404) {
                setError("Este pedido no tiene pago registrado. Ve a 'Pagos y Facturacion' para crearlo primero.");
            } else {
                setError(err?.data?.detail || err?.message || "No se pudo confirmar el pago");
            }
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: adminGradient }}>
                <DashboardNavbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                    <div className="spinner-border text-light me-2" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando pedidos...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: adminGradient }}>
            <DashboardNavbar />

            <div className="container py-5">
                <div className="text-white mb-4">
                    <h1 className="display-5 fw-bold mb-2">Pedidos</h1>
                    <p className="mb-0 opacity-75">Gestiona los pedidos activos y consulta el historial.</p>
                </div>

                {error && (
                    <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white">
                        {error}
                    </div>
                )}

                <div className="card border-0 shadow-lg text-white mb-4"
                     style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
                    <div className="card-body">
                        <h2 className="h5 fw-bold mb-3">Pedidos activos</h2>

                        {activeOrders.length === 0 ? (
                            <p className="opacity-75">No hay pedidos activos en este momento.</p>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {activeOrders.map((order) => {
                                    const nextStatus = getNextStatus(order.status);
                                    return (
                                        <div key={order.id} className="p-3 rounded" style={{ background: "rgba(0,0,0,0.25)" }}>
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <div className="fw-bold">Pedido {order.orderCode}</div>
                                                    <small className="opacity-75">{order.type} · Mesa {order.tableNumber || "-"}</small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold">S/ {formatAmount(order.totalAmount)}</div>
                                                    <small className="opacity-75">{order.paymentStatus}</small>
                                                </div>
                                            </div>
                                            <div className="mt-2 d-flex flex-wrap gap-2">
                                                <span className="badge bg-light text-dark">{STATUS_LABEL[order.status] || order.status}</span>
                                                <span className="badge bg-light text-dark">{order.items?.length || 0} producto(s)</span>
                                            </div>
                                            <div className="mt-3 d-flex flex-wrap gap-2">
                                                {nextStatus && (
                                                    <button
                                                        className="btn btn-outline-light btn-sm"
                                                        onClick={() => handleAdvanceStatus(order.id, order.status)}
                                                        disabled={busy}
                                                    >
                                                        Pasar a {STATUS_LABEL[nextStatus]}
                                                    </button>
                                                )}
                                                {order.paymentStatus === "PENDIENTE" && (
                                                    <button
                                                        className="btn btn-outline-warning btn-sm"
                                                        onClick={() => handleConfirmPayment(order.id)}
                                                        disabled={busy}
                                                    >
                                                        Confirmar pago en caja
                                                    </button>
                                                )}
                                                {order.paymentStatus === "PAGADO" && (
                                                    <a
                                                        href="#"
                                                        className="btn btn-outline-light btn-sm"
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            try {
                                                                const p = await getPaymentByOrder(order.id);
                                                                window.open(getReceiptUrl(p.id), '_blank');
                                                            } catch { setError("No se encontro el comprobante"); }
                                                        }}
                                                    >
                                                        Ver comprobante
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card border-0 shadow-lg text-white"
                     style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
                    <div className="card-body">
                        <h2 className="h5 fw-bold mb-3">Historial de pedidos</h2>

                        {historyOrders.length === 0 ? (
                            <p className="opacity-75">No hay pedidos completados aun.</p>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {historyOrders.map((order) => (
                                    <div key={order.id} className="p-3 rounded" style={{ background: "rgba(0,0,0,0.25)" }}>
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <div className="fw-bold">Pedido {order.orderCode}</div>
                                                <small className="opacity-75">{order.type} · Mesa {order.tableNumber || "-"}</small>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold">S/ {formatAmount(order.totalAmount)}</div>
                                                <small className="opacity-75">{order.paymentStatus}</small>
                                            </div>
                                        </div>
                                        <div className="mt-2 d-flex flex-wrap gap-2">
                                            <span className="badge bg-light text-dark">{STATUS_LABEL[order.status] || order.status}</span>
                                            <span className="badge bg-light text-dark">{order.items?.length || 0} producto(s)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
