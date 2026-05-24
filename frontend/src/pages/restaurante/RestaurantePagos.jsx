import { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useAuth } from "../../hooks/useAuth";
import { listActiveOrders, listOrderHistory } from "../../services/ordersApi";
import {
    confirmPayment,
    createPayment,
    getReceiptHtmlUrl,
    listPayments,
    simulateQrPayment
} from "../../services/paymentsApi";

const adminGradient = "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)";
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
    const { user, loading } = useAuth(["restaurante"]);
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

    const handleCreatePayment = async (order) => {
        setBusy(true);
        setError("");
        setSuccess("");
        try {
            const method = selectedMethodByOrder[order.id] || "CASH";
            await createPayment({
                orderId: order.id,
                restaurantId: toUUID(restaurantId),
                amount: order.totalAmount,
                method
            });
            setSuccess("Pago creado correctamente");
            await loadData();
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
            <div className="min-vh-100 d-flex flex-column" style={{ background: adminGradient }}>
                <DashboardNavbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                    <div className="spinner-border text-light me-2" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando pagos...</p>
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
                    <h1 className="display-5 fw-bold mb-2">Pagos y Facturacion</h1>
                    <p className="mb-0 opacity-75">
                        Crea y confirma pagos en caja o QR, y descarga comprobantes.
                    </p>
                </div>

                {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white">{error}</div>}
                {success && <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white">{success}</div>}

                <div className="row g-4">
                    <div className="col-12 col-lg-7">
                        <div className="card border-0 shadow-lg text-white"
                             style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h2 className="h5 fw-bold mb-0">Pedidos pendientes de pago</h2>
                                    <button className="btn btn-outline-light btn-sm" onClick={loadData} disabled={busy}>
                                        Actualizar
                                    </button>
                                </div>

                                {orders.filter((order) => order.paymentStatus === "PENDIENTE").length === 0 ? (
                                    <p className="opacity-75">No hay pedidos pendientes de pago.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {orders.filter((order) => order.paymentStatus === "PENDIENTE").map((order) => {
                                            const payment = getPaymentForOrder(order.id);
                                            return (
                                                <div key={order.id} className="p-3 rounded" style={{ background: "rgba(0,0,0,0.25)" }}>
                                                    <div className="d-flex justify-content-between gap-3">
                                                        <div>
                                                            <div className="fw-bold">Pedido {order.orderCode}</div>
                                                            <small className="opacity-75">{order.type} · Mesa {order.tableNumber || "-"}</small>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="fw-bold">S/ {formatAmount(order.totalAmount)}</div>
                                                            <small className="opacity-75">{order.status}</small>
                                                        </div>
                                                    </div>

                                                    {!payment ? (
                                                        <div className="row g-2 mt-3">
                                                            <div className="col-12 col-md-7">
                                                                <select
                                                                    className="form-select"
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
                                                            </div>
                                                            <div className="col-12 col-md-5">
                                                                <button
                                                                    className="btn btn-light w-100 fw-bold"
                                                                    onClick={() => handleCreatePayment(order)}
                                                                    disabled={busy}
                                                                >
                                                                    Crear pago
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-3 d-flex flex-wrap align-items-center gap-2">
                                                            <span className="badge bg-light text-dark">{payment.method}</span>
                                                            <span className="badge bg-warning text-dark">{payment.status}</span>
                                                            {payment.status === "PENDING" && (
                                                                <button
                                                                    className="btn btn-outline-warning btn-sm"
                                                                    onClick={() => handleConfirmPayment(payment)}
                                                                    disabled={busy}
                                                                >
                                                                    {payment.method === "QR_ONLINE" ? "Simular pago QR" : "Confirmar pago en caja"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-5">
                        <div className="card border-0 shadow-lg text-white"
                             style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
                            <div className="card-body">
                                <h2 className="h5 fw-bold mb-3">Pagos generados</h2>

                                {payments.length === 0 ? (
                                    <p className="opacity-75">Todavia no hay pagos registrados.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {payments.map((payment) => (
                                            <div key={payment.id} className="p-3 rounded" style={{ background: "rgba(0,0,0,0.25)" }}>
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <div className="fw-bold">{payment.method}</div>
                                                        <small className="opacity-75">{payment.id}</small>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="fw-bold">S/ {formatAmount(payment.amount)}</div>
                                                        <small className="opacity-75">{payment.status}</small>
                                                    </div>
                                                </div>

                                                {payment.qrPayload && (
                                                    <div className="mt-3 p-3 rounded text-center bg-white text-dark">
                                                        <div className="mx-auto mb-2 d-grid"
                                                             style={{
                                                                 width: "120px",
                                                                 height: "120px",
                                                                 gridTemplateColumns: "repeat(6, 1fr)",
                                                                 gap: "4px"
                                                             }}>
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
                                                        <div className="small fw-semibold">QR simulado</div>
                                                        <div className="small text-break">{payment.qrPayload}</div>
                                                    </div>
                                                )}

                                                <div className="mt-3 d-flex flex-wrap gap-2">
                                                    {payment.status === "PENDING" && (
                                                        <button
                                                            className="btn btn-outline-warning btn-sm"
                                                            onClick={() => handleConfirmPayment(payment)}
                                                            disabled={busy}
                                                        >
                                                            Confirmar
                                                        </button>
                                                    )}
                                                    {payment.receipt && (
                                                        <a
                                                            className="btn btn-outline-light btn-sm"
                                                            href={getReceiptHtmlUrl(payment.id)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Ver comprobante
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
