import { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useAuth } from "../../hooks/useAuth";
import {
    changeOrderStatus,
    confirmOrderPayment,
    createOrder,
    listActiveOrders,
    listOrderHistory
} from "../../services/ordersApi";

const STATUS_FLOW = ["RECIBIDO", "PREPARANDO", "LISTO", "ENTREGADO"];

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

    const [orderType, setOrderType] = useState("MESA");
    const [tableNumber, setTableNumber] = useState("");
    const [items, setItems] = useState([]);
    const [draftItem, setDraftItem] = useState({
        productId: "",
        productName: "",
        quantity: 1,
        unitPrice: ""
    });

    const restaurantId = useMemo(() => {
        return user?.restaurant?.id || user?.restaurant_id || "";
    }, [user]);

    const adminGradient = "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)";

    const loadActiveOrders = async () => {
        if (!restaurantId) return;
        setBusy(true);
        setError("");
        try {
            const data = await listActiveOrders(restaurantId);
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
            const data = await listOrderHistory(restaurantId);
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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId]);

    const handleAddItem = () => {
        setError("");
        if (!draftItem.productId.trim()) {
            setError("El productId es requerido");
            return;
        }
        if (!draftItem.productName.trim()) {
            setError("El nombre del producto es requerido");
            return;
        }
        if (!draftItem.unitPrice) {
            setError("El precio unitario es requerido");
            return;
        }
        if (Number(draftItem.quantity) <= 0) {
            setError("La cantidad debe ser mayor a 0");
            return;
        }
        setItems((prev) => [
            ...prev,
            {
                productId: draftItem.productId.trim(),
                productName: draftItem.productName.trim(),
                quantity: Number(draftItem.quantity),
                unitPrice: Number(draftItem.unitPrice),
                options: []
            }
        ]);
        setDraftItem({ productId: "", productName: "", quantity: 1, unitPrice: "" });
    };

    const handleRemoveItem = (index) => {
        setItems((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleCreateOrder = async () => {
        setError("");
        if (!restaurantId) {
            setError("No hay restaurante asignado para crear pedidos");
            return;
        }
        if (orderType === "MESA" && !tableNumber.trim()) {
            setError("El numero de mesa es requerido");
            return;
        }
        if (items.length === 0) {
            setError("Agrega al menos un item al pedido");
            return;
        }

        setBusy(true);
        try {
            await createOrder({
                restaurantId,
                type: orderType,
                tableNumber: orderType === "MESA" ? tableNumber.trim() : null,
                items
            });
            setTableNumber("");
            setItems([]);
            await loadActiveOrders();
        } catch (err) {
            setError(err?.message || "No se pudo crear el pedido");
        } finally {
            setBusy(false);
        }
    };

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
            await confirmOrderPayment(orderId);
            await loadActiveOrders();
        } catch (err) {
            setError(err?.message || "No se pudo confirmar el pago");
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
                    <h1 className="display-5 fw-bold mb-2">Pedidos del Restaurante</h1>
                    <p className="mb-0 opacity-75">Pantalla simple para probar el servicio de pedidos (Spring Boot).</p>
                </div>

                {error && (
                    <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white">
                        {error}
                    </div>
                )}

                <div className="row g-4">
                    <div className="col-12 col-lg-5">
                        <div className="card border-0 shadow-lg text-white"
                             style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
                            <div className="card-body">
                                <h2 className="h5 fw-bold mb-3">Crear pedido de prueba</h2>

                                <div className="mb-3">
                                    <label className="form-label small text-white-50">Tipo de pedido</label>
                                    <select
                                        className="form-select"
                                        value={orderType}
                                        onChange={(e) => setOrderType(e.target.value)}
                                    >
                                        <option value="MESA">MESA</option>
                                        <option value="PICKUP">PICKUP</option>
                                    </select>
                                </div>

                                {orderType === "MESA" && (
                                    <div className="mb-3">
                                        <label className="form-label small text-white-50">Numero de mesa</label>
                                        <input
                                            className="form-control"
                                            placeholder="Ej: 12"
                                            value={tableNumber}
                                            onChange={(e) => setTableNumber(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="border-top border-white border-opacity-10 my-3"></div>

                                <h3 className="h6 fw-bold">Items</h3>
                                <div className="row g-2 mb-3">
                                    <div className="col-12">
                                        <input
                                            className="form-control"
                                            placeholder="productId (UUID)"
                                            value={draftItem.productId}
                                            onChange={(e) => setDraftItem({ ...draftItem, productId: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <input
                                            className="form-control"
                                            placeholder="Nombre del producto"
                                            value={draftItem.productName}
                                            onChange={(e) => setDraftItem({ ...draftItem, productName: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            placeholder="Cantidad"
                                            value={draftItem.quantity}
                                            onChange={(e) => setDraftItem({ ...draftItem, quantity: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            className="form-control"
                                            step="0.01"
                                            placeholder="Precio"
                                            value={draftItem.unitPrice}
                                            onChange={(e) => setDraftItem({ ...draftItem, unitPrice: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <button
                                            type="button"
                                            className="btn btn-outline-light w-100"
                                            onClick={handleAddItem}
                                        >
                                            Agregar item
                                        </button>
                                    </div>
                                </div>

                                {items.length > 0 && (
                                    <ul className="list-group list-group-flush mb-3">
                                        {items.map((item, index) => (
                                            <li key={`${item.productId}-${index}`} className="list-group-item bg-transparent text-white d-flex justify-content-between">
                                                <div>
                                                    <div className="fw-bold">{item.productName}</div>
                                                    <small className="opacity-75">{item.productId}</small>
                                                </div>
                                                <div className="text-end">
                                                    <div>x{item.quantity}</div>
                                                    <div>S/ {formatAmount(item.unitPrice)}</div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-link text-danger"
                                                        onClick={() => handleRemoveItem(index)}
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-light w-100 fw-bold"
                                    onClick={handleCreateOrder}
                                    disabled={busy}
                                >
                                    Crear pedido
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-7">
                        <div className="card border-0 shadow-lg text-white mb-4"
                             style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h2 className="h5 fw-bold mb-0">Pedidos activos</h2>
                                    <button className="btn btn-outline-light btn-sm" onClick={loadActiveOrders} disabled={busy}>
                                        Actualizar
                                    </button>
                                </div>

                                {activeOrders.length === 0 ? (
                                    <p className="opacity-75">No hay pedidos activos.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {activeOrders.map((order) => {
                                            const nextStatus = getNextStatus(order.status);
                                            return (
                                                <div key={order.id} className="p-3 rounded" style={{ background: "rgba(0,0,0,0.25)" }}>
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <div className="fw-bold">Codigo: {order.orderCode}</div>
                                                            <small className="opacity-75">{order.type} · Mesa {order.tableNumber || "-"}</small>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="fw-bold">S/ {formatAmount(order.totalAmount)}</div>
                                                            <small className="opacity-75">{order.paymentStatus}</small>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 d-flex flex-wrap gap-2">
                                                        <span className="badge bg-light text-dark">{order.status}</span>
                                                        <span className="badge bg-light text-dark">Items: {order.items?.length || 0}</span>
                                                    </div>
                                                    <div className="mt-3 d-flex flex-wrap gap-2">
                                                        {nextStatus && (
                                                            <button
                                                                className="btn btn-outline-light btn-sm"
                                                                onClick={() => handleAdvanceStatus(order.id, order.status)}
                                                                disabled={busy}
                                                            >
                                                                Pasar a {nextStatus}
                                                            </button>
                                                        )}
                                                        {order.paymentStatus === "PENDIENTE" && (
                                                            <button
                                                                className="btn btn-outline-warning btn-sm"
                                                                onClick={() => handleConfirmPayment(order.id)}
                                                                disabled={busy}
                                                            >
                                                                Confirmar pago
                                                            </button>
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
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h2 className="h5 fw-bold mb-0">Historial</h2>
                                    <button className="btn btn-outline-light btn-sm" onClick={loadHistoryOrders} disabled={busy}>
                                        Cargar historial
                                    </button>
                                </div>

                                {historyOrders.length === 0 ? (
                                    <p className="opacity-75">Aun no se han cargado pedidos historicos.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {historyOrders.map((order) => (
                                            <div key={order.id} className="p-3 rounded" style={{ background: "rgba(0,0,0,0.25)" }}>
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <div className="fw-bold">Codigo: {order.orderCode}</div>
                                                        <small className="opacity-75">{order.type} · Mesa {order.tableNumber || "-"}</small>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="fw-bold">S/ {formatAmount(order.totalAmount)}</div>
                                                        <small className="opacity-75">{order.paymentStatus}</small>
                                                    </div>
                                                </div>
                                                <div className="mt-2 d-flex flex-wrap gap-2">
                                                    <span className="badge bg-light text-dark">{order.status}</span>
                                                    <span className="badge bg-light text-dark">Items: {order.items?.length || 0}</span>
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
