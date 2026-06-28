import { useEffect, useMemo, useState } from "react";
import RestauranteShell from "../../components/RestauranteShell";
import { useAuth } from "../../hooks/useAuth";
import { listActiveOrders, listOrderHistory } from "../../services/ordersApi";
import {
    confirmPayment,
    createPayment,
    getPaymentByOrder,
    getReceiptHtmlUrl,
    listPayments,
    simulateQrPayment
} from "../../services/paymentsApi";

const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, '0')}`;

const formatAmount = (value) => {
    const number = Number(value);
    if (Number.isNaN(number)) return "0.00";
    return number.toFixed(2);
};

const getErrorMessage = (err, fallback) => {
    return err?.detail || err?.message || fallback;
};

export default function RestaurantePagos() {
    const { user, loading } = useAuth(["empleado"]);
    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [selectedMethodByOrder, setSelectedMethodByOrder] = useState({});
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const restaurantId = useMemo(() => {
        return user?.restaurant?.id || user?.restaurant_id || "";
    }, [user]);

    const loadData = async () => {
        if (!restaurantId) return;
        setBusy(true);
        setError("");
        try {
            const [activeData, historyData, paymentsData] = await Promise.all([
                listActiveOrders(toUUID(restaurantId)),
                listOrderHistory(toUUID(restaurantId)),
                listPayments(toUUID(restaurantId))
            ]);
            const seen = new Set();
            const allOrders = [...activeData, ...historyData].filter((o) => {
                if (seen.has(o.id)) return false;
                seen.add(o.id);
                return true;
            });
            setOrders(allOrders);
            setPayments(paymentsData);
        } catch (err) {
            setError(getErrorMessage(err, "No se pudieron cargar pagos y pedidos"));
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        if (restaurantId) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId]);

    const getPaymentForOrder = (orderId) => {
        return payments.find((payment) => payment.orderId === orderId);
    };

    // HANDLE CREATE PAYMENT - CORREGIDO
    const handleCreatePayment = async (order) => {
        setBusy(true);
        setError("");
        setSuccess("");
        try {
            // 1. Verificar si el pago ya existe
            let existingPayment;
            try {
                existingPayment = await getPaymentByOrder(order.id);
                // Si existe, mostrar mensaje y recargar
                setSuccess("Este pedido ya tiene un pago generado");
                await loadData();
                return;
            } catch (err) {
                // 2. Si no existe (404), CREAR el pago
                if (err?.status === 404 || err?.response?.status === 404) {
                    const method = selectedMethodByOrder[order.id] || "CASH";
                    await createPayment({
                        orderId: order.id,
                        restaurantId: toUUID(restaurantId),
                        amount: order.totalAmount,
                        method
                    });
                    setSuccess("Pago creado correctamente");
                    await loadData();
                } else {
                    throw err;
                }
            }
        } catch (err) {
            setError(getErrorMessage(err, "No se pudo crear el pago"));
        } finally {
            setBusy(false);
        }
    };

    const handleConfirmPayment = async (payment) => {
        setBusy(true);
        setError("");
        setSuccess("");
        try {
            if (payment.method === "QR_ONLINE") {
                await simulateQrPayment(payment.id);
            } else {
                await confirmPayment(payment.id, "BOLETA");
            }
            setSuccess("Pago confirmado. Orders se actualizara mediante RabbitMQ.");
            await loadData();
            setTimeout(loadData, 700);
        } catch (err) {
            setError(getErrorMessage(err, "No se pudo confirmar el pago"));
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return (
            <RestauranteShell title="Pagos y facturacion" subtitle="Cargando pagos...">
                <div className="d-flex align-items-center justify-content-center text-white" style={{ minHeight: "60vh" }}>
                    <div className="spinner-border text-light me-2" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando pagos...</p>
                </div>
            </RestauranteShell>
        );
    }

    if (!user) return null;

    return (
        <RestauranteShell
            title="Pagos y facturacion"
            subtitle="Crea y confirma pagos en caja o QR, y descarga comprobantes."
            actions={
                <button className="resto-btn-ghost" type="button" onClick={loadData} disabled={busy}>
                    Actualizar
                </button>
            }
        >
            {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white">{error}</div>}
            {success && <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white">{success}</div>}

            <div className="resto-payments-grid">
                <div className="resto-payments-card">
                    <div className="resto-card-header">
                        <h2>Pedidos pendientes de pago</h2>
                        <span className="resto-badge">{orders.filter((order) => order.paymentStatus === "PENDIENTE").length}</span>
                    </div>

                    {orders.filter((order) => order.paymentStatus === "PENDIENTE").length === 0 ? (
                        <div className="resto-empty">No hay pedidos pendientes de pago.</div>
                    ) : (
                        <div className="resto-payments-list">
                            {orders.filter((order) => order.paymentStatus === "PENDIENTE").map((order) => {
                                const payment = getPaymentForOrder(order.id);
                                return (
                                    <div key={order.id} className="resto-payment-item">
                                        <div className="resto-payment-top">
                                            <div>
                                                <div className="resto-code">Pedido {order.orderCode}</div>
                                                <div className="resto-muted">{order.type} · Mesa {order.tableNumber || "-"}</div>
                                            </div>
                                            <div className="resto-amount">S/ {formatAmount(order.totalAmount)}</div>
                                        </div>

                                        {!payment ? (
                                            <div className="resto-payment-actions">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={selectedMethodByOrder[order.id] || "CASH"}
                                                    onChange={(e) => setSelectedMethodByOrder({
                                                        ...selectedMethodByOrder,
                                                        [order.id]: e.target.value
                                                    })}
                                                >
                                                    <option value="CASH">Caja - efectivo</option>
                                                    <option value="CARD">Caja - tarjeta</option>
                                                    <option value="QR_ONLINE">QR online simulado</option>
                                                </select>
                                                <button
                                                    className="resto-btn-primary"
                                                    onClick={() => handleCreatePayment(order)}
                                                    disabled={busy}
                                                >
                                                    Crear pago
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="resto-payment-meta">
                                                <span className="resto-pill cash">{payment.method}</span>
                                                <span className="resto-pill paid">{payment.status}</span>
                                                {payment.status === "PENDING" && (
                                                    <span className="resto-muted">Pago creado; confirma desde pagos generados.</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="resto-payments-card">
                    <div className="resto-card-header">
                        <h2>Pagos generados</h2>
                        <span className="resto-badge">{payments.length}</span>
                    </div>

                    {payments.length === 0 ? (
                        <div className="resto-empty">Todavia no hay pagos registrados.</div>
                    ) : (
                        <div className="resto-payments-list">
                            {payments.map((payment) => (
                                <div key={payment.id} className="resto-payment-item">
                                    <div className="resto-payment-top">
                                        <div>
                                            <div className="resto-code">{payment.method}</div>
                                            <div className="resto-muted">{payment.id}</div>
                                        </div>
                                        <div className="resto-amount">S/ {formatAmount(payment.amount)}</div>
                                    </div>

                                    {payment.qrPayload && (
                                        <div className="resto-qr-preview">
                                            <div className="resto-qr-grid">
                                                {Array.from({ length: 36 }).map((_, index) => (
                                                    <span
                                                        key={index}
                                                        style={{
                                                            background: (index + payment.id.length) % 3 === 0 ? "#111" : "#fff",
                                                            border: "1px solid #111"
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <small>QR simulado</small>
                                        </div>
                                    )}

                                    <div className="resto-payment-actions">
                                        {payment.status === "PENDING" && (
                                            <button
                                                className="resto-btn-primary"
                                                onClick={() => handleConfirmPayment(payment)}
                                                disabled={busy}
                                            >
                                                Confirmar pago
                                            </button>
                                        )}
                                        {payment.receipt && (
                                            <button
                                                className="resto-btn-ghost"
                                                onClick={() => getReceiptHtmlUrl(payment.id)}
                                            >
                                                Ver comprobante
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .resto-btn-primary {
                    background: #d44a42;
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    padding: 8px 12px;
                    font-weight: 700;
                }
                .resto-btn-ghost {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 12px;
                    padding: 8px 12px;
                    font-weight: 600;
                }
                .resto-payments-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 18px;
                }
                .resto-payments-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 18px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .resto-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .resto-card-header h2 {
                    font-size: 1rem;
                    font-weight: 700;
                    margin: 0;
                }
                .resto-badge {
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 999px;
                    padding: 4px 8px;
                    font-size: 0.75rem;
                }
                .resto-payments-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .resto-payment-item {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 14px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .resto-payment-top {
                    display: flex;
                    justify-content: space-between;
                    gap: 8px;
                }
                .resto-amount {
                    font-weight: 700;
                }
                .resto-payment-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    align-items: center;
                }
                .resto-payment-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    align-items: center;
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
                .resto-qr-preview {
                    background: #fff;
                    color: #111;
                    border-radius: 12px;
                    padding: 10px;
                    text-align: center;
                }
                .resto-qr-grid {
                    margin: 0 auto 6px;
                    width: 120px;
                    height: 120px;
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 4px;
                }
                .resto-empty {
                    color: rgba(255, 255, 255, 0.6);
                }
                .resto-muted {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.8rem;
                }
                .resto-code {
                    font-weight: 700;
                }
                @media (max-width: 1100px) {
                    .resto-payments-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </RestauranteShell>
    );
}