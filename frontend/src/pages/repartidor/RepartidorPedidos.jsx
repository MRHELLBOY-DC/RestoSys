import { useEffect, useMemo, useState } from "react";
import RestauranteShell from "../../components/RestauranteShell";
import RouteMap from "../../components/RouteMap";
import { useAuth } from "../../hooks/useAuth";
import { changeOrderStatus, listActiveOrders, listOrderHistory, notifyArrival } from "../../services/ordersApi";
import { getPublicRestaurantes } from "../../services/api";

const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, '0')}`;

const formatAmount = (value) => {
    const number = Number(value);
    return Number.isNaN(number) ? "0.00" : number.toFixed(2);
};

export default function RepartidorPedidos() {
    const { user, loading } = useAuth(["repartidor"]);
    const [restaurant, setRestaurant] = useState(null);
    const [activeOrders, setActiveOrders] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [notifiedIds, setNotifiedIds] = useState(() => new Set());

    const restaurantId = useMemo(() => user?.restaurant?.id || user?.restaurant_id || "", [user]);

    const loadData = async () => {
        if (!restaurantId) return;
        setBusy(true);
        setError("");
        try {
            const [restaurantes, active, history] = await Promise.all([
                getPublicRestaurantes().catch(() => []),
                listActiveOrders(toUUID(restaurantId)),
                listOrderHistory(toUUID(restaurantId)),
            ]);
            setRestaurant((restaurantes || []).find(r => r.id === Number(restaurantId)) || null);
            setActiveOrders((active || []).filter(o => o.type === "DELIVERY"));
            setHistoryOrders((history || []).filter(o => o.type === "DELIVERY"));
        } catch (err) {
            setError(err?.message || "No se pudieron cargar los pedidos");
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        if (restaurantId) loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId]);

    const handleChangeStatus = async (orderId, newStatus) => {
        setBusy(true);
        setError("");
        try {
            await changeOrderStatus(orderId, newStatus);
            await loadData();
        } catch (err) {
            setError(err?.message || "No se pudo actualizar el estado");
        } finally {
            setBusy(false);
        }
    };

    const handleNotifyArrival = async (orderId) => {
        setBusy(true);
        setError("");
        try {
            await notifyArrival(orderId);
            setNotifiedIds(prev => new Set(prev).add(orderId));
        } catch (err) {
            setError(err?.message || "No se pudo notificar la llegada");
        } finally {
            setBusy(false);
        }
    };

    const formatItems = (order) => {
        const items = order.items || [];
        if (items.length === 0) return "Sin items";
        return items.slice(0, 3).map((item) => `${item.quantity}x ${item.productName}`).join(" · ");
    };

    const listos = activeOrders.filter(o => o.status === "LISTO");
    const enCamino = activeOrders.filter(o => o.status === "EN_CAMINO");

    const restaurantOrigin = restaurant?.lat != null && restaurant?.lng != null
        ? { lat: restaurant.lat, lng: restaurant.lng }
        : null;

    if (loading) {
        return (
            <RestauranteShell title="Entregas" subtitle="Cargando pedidos...">
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
                    <div className="spinner-border me-2" style={{ color: '#e4531f' }} role="status"></div>
                    <p className="mb-0 fw-bold">Cargando pedidos...</p>
                </div>
            </RestauranteShell>
        );
    }

    if (!user) return null;

    return (
        <RestauranteShell title="Entregas" subtitle="Pedidos delivery de tu restaurante">
            {error && (
                <div className="alert border-0" style={{ background: '#fff0ef', color: '#9d221c', borderRadius: 12 }}>
                    {error}
                </div>
            )}

            <div className="repartidor-grid">
                <div className="repartidor-column">
                    <div className="repartidor-column-header">
                        <span>Listos para recoger</span>
                        <span className="repartidor-count">{listos.length}</span>
                    </div>
                    <div className="repartidor-column-body">
                        {listos.length === 0 && <p className="text-muted small">No hay pedidos listos.</p>}
                        {listos.map(order => (
                            <div key={order.id} className="repartidor-card">
                                <div className="repartidor-card-top">
                                    <strong>{order.orderCode}</strong>
                                    <span>Bs {formatAmount(order.totalAmount)}</span>
                                </div>
                                <div className="repartidor-items">{formatItems(order)}</div>
                                <div className="repartidor-address">
                                    <i className="fa-solid fa-location-dot me-1"></i>
                                    {order.deliveryAddress || "Sin direccion"}
                                </div>
                                <button
                                    className="repartidor-action"
                                    onClick={() => handleChangeStatus(order.id, "EN_CAMINO")}
                                    disabled={busy}
                                >
                                    Recoger pedido
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="repartidor-column">
                    <div className="repartidor-column-header">
                        <span>En camino</span>
                        <span className="repartidor-count">{enCamino.length}</span>
                    </div>
                    <div className="repartidor-column-body">
                        {enCamino.length === 0 && <p className="text-muted small">No hay entregas en curso.</p>}
                        {enCamino.map(order => (
                            <div key={order.id} className="repartidor-card">
                                <div className="repartidor-card-top">
                                    <strong>{order.orderCode}</strong>
                                    <span>Bs {formatAmount(order.totalAmount)}</span>
                                </div>
                                <div className="repartidor-items">{formatItems(order)}</div>
                                <div className="repartidor-address">
                                    <i className="fa-solid fa-location-dot me-1"></i>
                                    {order.deliveryAddress || "Sin direccion"}
                                </div>
                                {restaurantOrigin && order.deliveryLat != null && order.deliveryLng != null && (
                                    <RouteMap
                                        origin={restaurantOrigin}
                                        destination={{ lat: order.deliveryLat, lng: order.deliveryLng }}
                                        originLabel="Restaurante"
                                        destinationLabel="Cliente"
                                    />
                                )}
                                <button
                                    className="repartidor-action repartidor-action--outline"
                                    onClick={() => handleNotifyArrival(order.id)}
                                    disabled={busy || notifiedIds.has(order.id)}
                                >
                                    {notifiedIds.has(order.id) ? "Cliente notificado" : "Notificar llegada"}
                                </button>
                                <button
                                    className="repartidor-action"
                                    onClick={() => handleChangeStatus(order.id, "ENTREGADO")}
                                    disabled={busy}
                                >
                                    Marcar entregado
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="repartidor-history">
                <div className="repartidor-history-header">Historial de entregas</div>
                {historyOrders.length === 0 ? (
                    <p className="text-muted small mb-0">No hay entregas completadas aun.</p>
                ) : (
                    <div className="repartidor-history-list">
                        {historyOrders.map(order => (
                            <div key={order.id} className="repartidor-history-item">
                                <div>
                                    <strong>{order.orderCode}</strong>
                                    <div className="text-muted small">{order.deliveryAddress || "-"}</div>
                                </div>
                                <span className="text-muted small">Bs {formatAmount(order.totalAmount)}</span>
                                <span className="repartidor-pill">{order.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .repartidor-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(280px, 1fr));
                    gap: 18px;
                }
                .repartidor-column {
                    background: #ffffff;
                    border-radius: 18px;
                    padding: 16px;
                    border: 1px solid #ebe1d5;
                    box-shadow: 0 18px 38px -30px rgba(33, 26, 21, 0.36);
                }
                .repartidor-column-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: #211a15;
                }
                .repartidor-count {
                    background: #ffeee4;
                    color: #c23d12;
                    padding: 2px 8px;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .repartidor-column-body {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .repartidor-card {
                    background: #faf5ee;
                    border-radius: 16px;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    border: 1px solid #ebe1d5;
                }
                .repartidor-card-top {
                    display: flex;
                    justify-content: space-between;
                    color: #211a15;
                }
                .repartidor-items {
                    font-size: 0.82rem;
                    color: #211a15;
                }
                .repartidor-address {
                    font-size: 0.8rem;
                    color: #8c8178;
                }
                .repartidor-action {
                    border: none;
                    border-radius: 12px;
                    padding: 8px 10px;
                    font-weight: 700;
                    background: #e4531f;
                    color: #fff;
                    cursor: pointer;
                }
                .repartidor-action--outline {
                    background: #f1e9fb;
                    color: #6f42c1;
                    border: 1px solid #d9c6f2;
                }
                .repartidor-action:disabled {
                    opacity: 0.6;
                    cursor: default;
                }
                .repartidor-history {
                    background: #ffffff;
                    border-radius: 18px;
                    padding: 16px;
                    border: 1px solid #ebe1d5;
                    box-shadow: 0 18px 38px -30px rgba(33, 26, 21, 0.36);
                }
                .repartidor-history-header {
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: #211a15;
                }
                .repartidor-history-list {
                    display: grid;
                    gap: 10px;
                }
                .repartidor-history-item {
                    display: grid;
                    grid-template-columns: 1fr auto auto;
                    gap: 12px;
                    align-items: center;
                    background: #faf5ee;
                    border: 1px solid #ebe1d5;
                    padding: 12px 14px;
                    border-radius: 12px;
                }
                .repartidor-pill {
                    background: #eaf3ee;
                    color: #2e7d5b;
                    padding: 2px 8px;
                    border-radius: 999px;
                    font-size: 0.7rem;
                    font-weight: 700;
                }
                @media (max-width: 768px) {
                    .repartidor-grid {
                        grid-template-columns: 1fr;
                    }
                    .repartidor-history-item {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </RestauranteShell>
    );
}
