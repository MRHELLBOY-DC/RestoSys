import { useEffect, useMemo, useState } from "react";
import RestauranteShell from "../../components/RestauranteShell";
import { useAuth } from "../../hooks/useAuth";
import { changeOrderStatus, listActiveOrders, listOrderHistory } from "../../services/ordersApi";
import { confirmPayment, getPaymentByOrder, getReceiptHtmlUrl } from "../../services/paymentsApi";

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
            await confirmPayment(payment.id, "BOLETA");
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

    const combinedOrders = useMemo(() => {
        const map = new Map();
        [...activeOrders, ...historyOrders].forEach((order) => {
            if (STATUS_FLOW.includes(order.status)) {
                map.set(order.id, order);
            }
        });
        return Array.from(map.values());
    }, [activeOrders, historyOrders]);

    const ordersByStatus = useMemo(() => {
        return STATUS_FLOW.reduce((acc, status) => {
            acc[status] = combinedOrders.filter((order) => order.status === status);
            return acc;
        }, {});
    }, [combinedOrders]);


    const formatItems = (order) => {
        const items = order.items || [];
        if (items.length === 0) return "Sin items";
        return items.slice(0, 3).map((item) => `${item.quantity}x ${item.productName}`).join(" · ");
    };

    if (loading) {
        return (
            <RestauranteShell title="Pedidos en vivo" subtitle="Cargando pedidos...">
                <div className="d-flex align-items-center justify-content-center text-white" style={{ minHeight: "60vh" }}>
                    <div className="spinner-border text-light me-2" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando pedidos...</p>
                </div>
            </RestauranteShell>
        );
    }

    if (!user) return null;

    return (
        <RestauranteShell
            title="Pedidos en vivo"
            subtitle={new Date().toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "long" })}
        >
            {error && (
                <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white">
                    {error}
                </div>
            )}

            <div className="resto-orders-grid">
                {STATUS_FLOW.map((status) => (
                    <div key={status} className="resto-column">
                        <div className="resto-column-header">
                            <span>{STATUS_LABEL[status]}</span>
                            <span className="resto-count">{ordersByStatus[status]?.length || 0}</span>
                        </div>

                        <div className="resto-column-body">
                            {(ordersByStatus[status] || []).map((order) => {
                                const nextStatus = getNextStatus(order.status);
                                const paymentBadge = order.paymentStatus === "PAGADO" ? "Pagado" : "En caja";
                                return (
                                    <div key={order.id} className="resto-card">
                                        <div className="resto-card-top">
                                            <div className="resto-code">{order.orderCode}</div>
                                            <div className="resto-time">{order.tableNumber ? `Mesa ${order.tableNumber}` : order.type}</div>
                                        </div>
                                        <div className="resto-items">{formatItems(order)}</div>
                                        <div className="resto-card-footer">
                                            <div className="resto-total">S/ {formatAmount(order.totalAmount)}</div>
                                            <span className={`resto-pill ${order.paymentStatus === "PAGADO" ? "paid" : "cash"}`}>
                                                {paymentBadge}
                                            </span>
                                        </div>

                                        {order.paymentStatus === "PENDIENTE" && (
                                            <button
                                                className="resto-action muted"
                                                onClick={() => handleConfirmPayment(order.id)}
                                                disabled={busy}
                                            >
                                                Confirmar pago en caja
                                            </button>
                                        )}

                                        {order.paymentStatus === "PAGADO" && (
                                            <button
                                                className="resto-action muted"
                                                onClick={async () => {
                                                    try {
                                                        const p = await getPaymentByOrder(order.id);
                                                        await getReceiptHtmlUrl(p.id);
                                                    } catch {
                                                        setError("No se encontro el comprobante");
                                                    }
                                                }}
                                            >
                                                Ver comprobante
                                            </button>
                                        )}

                                        {nextStatus && (
                                            <button
                                                className="resto-action"
                                                onClick={() => handleAdvanceStatus(order.id, order.status)}
                                                disabled={busy}
                                            >
                                                -&gt; {STATUS_LABEL[nextStatus].toUpperCase()}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="resto-history">
                <div className="resto-history-header">Historial</div>
                {historyOrders.length === 0 ? (
                    <div className="resto-empty">No hay pedidos completados aun.</div>
                ) : (
                    <div className="resto-history-list">
                        {historyOrders.map((order) => (
                            <div key={order.id} className="resto-history-item">
                                <div>
                                    <div className="resto-code">{order.orderCode}</div>
                                    <div className="resto-muted">{order.type} · Mesa {order.tableNumber || "-"}</div>
                                </div>
                                <div className="resto-muted">S/ {formatAmount(order.totalAmount)}</div>
                                <div className="resto-pill paid">{order.paymentStatus}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .resto-orders-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(220px, 1fr));
                    gap: 18px;
                }
                .resto-column {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 18px;
                    padding: 16px;
                    min-height: 420px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .resto-column-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 700;
                    margin-bottom: 12px;
                }
                .resto-count {
                    background: rgba(255, 255, 255, 0.08);
                    padding: 2px 8px;
                    border-radius: 999px;
                    font-size: 0.75rem;
                }
                .resto-column-body {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .resto-card {
                    background: rgba(0, 0, 0, 0.35);
                    border-radius: 16px;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                .resto-card-top {
                    display: flex;
                    justify-content: space-between;
                    font-weight: 700;
                }
                .resto-code {
                    letter-spacing: 0.5px;
                }
                .resto-time {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.75rem;
                }
                .resto-items {
                    color: rgba(255, 255, 255, 0.75);
                    font-size: 0.82rem;
                }
                .resto-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .resto-total {
                    font-weight: 700;
                }
                .resto-pill {
                    padding: 2px 8px;
                    border-radius: 999px;
                    font-size: 0.7rem;
                }
                .resto-pill.paid {
                    background: rgba(76, 175, 80, 0.2);
                    color: #9ad7a0;
                }
                .resto-pill.cash {
                    background: rgba(255, 193, 7, 0.2);
                    color: #f5d07a;
                }
                .resto-action {
                    width: 100%;
                    border: none;
                    border-radius: 12px;
                    padding: 8px 10px;
                    font-weight: 700;
                    background: #d44a42;
                    color: #fff;
                    cursor: pointer;
                }
                .resto-action.muted {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.8);
                }
                .resto-history {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 18px;
                    padding: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .resto-history-header {
                    font-weight: 700;
                    margin-bottom: 12px;
                }
                .resto-history-list {
                    display: grid;
                    gap: 10px;
                }
                .resto-history-item {
                    display: grid;
                    grid-template-columns: 1fr auto auto;
                    gap: 12px;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.25);
                    padding: 12px 14px;
                    border-radius: 12px;
                }
                .resto-muted {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.8rem;
                }
                .resto-empty {
                    color: rgba(255, 255, 255, 0.6);
                }
                @media (max-width: 1200px) {
                    .resto-orders-grid {
                        grid-template-columns: repeat(2, minmax(220px, 1fr));
                    }
                }
                @media (max-width: 768px) {
                    .resto-orders-grid {
                        grid-template-columns: 1fr;
                    }
                    .resto-history-item {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </RestauranteShell>
    );
}
