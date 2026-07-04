import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../../components/AdminShell";
import { useAuth } from "../../../hooks/useAuth";
import { getSalesByDay, getTopProducts } from "../../../services/reportsApi";
import { listActiveOrders } from "../../../services/ordersApi";

const toDateInput = (date) => date.toISOString().slice(0, 10);
const startOfDayIso = (dateText) => `${dateText}T00:00:00.000Z`;
const endOfDayIso = (dateText) => `${dateText}T23:59:59.999Z`;
const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, "0")}`;

const formatMoney = (value) => {
    const number = Number(value);
    return Number.isNaN(number) ? "0.00" : number.toFixed(2);
};

const getErrorMessage = (err, fallback) => err?.data?.detail || err?.data?.message || err?.message || fallback;

export default function AdminRestauranteReportes() {
    const { user, loading } = useAuth(["restaurante"]);
    const today = toDateInput(new Date());
    const sevenDaysAgo = toDateInput(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

    const [fromDate, setFromDate] = useState(sevenDaysAgo);
    const [toDate, setToDate] = useState(today);
    const [salesByDay, setSalesByDay] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [enPreparacion, setEnPreparacion] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const restaurantId = useMemo(() => user?.restaurant?.id || user?.restaurant_id || "", [user]);

    const loadReports = async () => {
        if (!restaurantId) return;
        setBusy(true);
        setError("");
        setSuccess("");
        try {
            const from = startOfDayIso(fromDate);
            const to = endOfDayIso(toDate);
            const restaurantUuid = toUUID(restaurantId);
            const [salesData, productsData, activeOrders] = await Promise.all([
                getSalesByDay(restaurantUuid, from, to),
                getTopProducts(restaurantUuid, from, to, 5),
                listActiveOrders(restaurantUuid).catch(() => []),
            ]);
            setSalesByDay(salesData);
            setTopProducts(productsData);
            setEnPreparacion((activeOrders || []).filter(o =>
                o.status === "PREPARANDO" || o.status === "RECIBIDO"
            ).length);
        } catch (err) {
            setError(getErrorMessage(err, "No se pudieron cargar los reportes"));
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        if (restaurantId) {
            loadReports();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId]);

    if (loading) {
        return (
            <AdminShell title="Reportes" subtitle="Cargando reportes...">
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
                    <div className="spinner-border me-2" style={{ color: '#e4531f' }} role="status"></div>
                    <p className="mb-0 fw-bold">Cargando reportes...</p>
                </div>
            </AdminShell>
        );
    }

    if (!user) return null;

    const totalPeriod = salesByDay.reduce((sum, item) => sum + Number(item.totalSales || 0), 0);
    const totalOrders = salesByDay.reduce((sum, item) => sum + Number(item.ordersCount || 0), 0);

    const ticketPromedio = totalOrders > 0 ? totalPeriod / totalOrders : 0;
    const salesSummary = salesByDay.slice(-7);

    return (
        <AdminShell 
            title="Reportes" 
            subtitle={new Date().toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "long" })}
        >
            {error && <div className="alert border-0" style={{ background: '#fff0ef', color: '#9d221c', borderRadius: 12 }}>{error}</div>}
            {success && <div className="alert border-0" style={{ background: '#eaf3ee', color: '#2e7d5b', borderRadius: 12 }}>{success}</div>}

            <div className="resto-filter">
                <div>
                    <label className="resto-label">Desde</label>
                    <input className="resto-input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div>
                    <label className="resto-label">Hasta</label>
                    <input className="resto-input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
                <button className="resto-btn" onClick={loadReports} disabled={busy}>Consultar</button>
            </div>

            <div className="resto-metrics">
                <div className="resto-metric">
                    <div className="resto-metric-label">Ventas hoy</div>
                    <div className="resto-metric-value">Bs {formatMoney(totalPeriod)}</div>
                    <div className="resto-metric-sub">Ultimos 7 dias</div>
                </div>
                <div className="resto-metric">
                    <div className="resto-metric-label">Pedidos hoy</div>
                    <div className="resto-metric-value">{totalOrders}</div>
                    <div className="resto-metric-sub">Ultimos 7 dias</div>
                </div>
                <div className="resto-metric">
                    <div className="resto-metric-label">Ticket promedio</div>
                    <div className="resto-metric-value">Bs {formatMoney(ticketPromedio)}</div>
                    <div className="resto-metric-sub">Por pedido</div>
                </div>
                <div className="resto-metric">
                    <div className="resto-metric-label">En preparacion</div>
                    <div className="resto-metric-value">{enPreparacion}</div>
                    <div className="resto-metric-sub">Ahora</div>
                </div>
            </div>

            <div className="resto-reports-grid">
                <div className="resto-chart">
                    <div className="resto-chart-title">Ventas por dia</div>
                    {salesSummary.length === 0 ? (
                        <div className="resto-empty">No hay ventas en el periodo.</div>
                    ) : (
                        <div className="resto-chart-bars">
                            {salesSummary.map((item) => (
                                <div key={item.date} className="resto-bar">
                                    <div className="resto-bar-value" style={{ height: `${Math.min(80, Number(item.totalSales || 0) / 20)}px` }}></div>
                                    <div className="resto-bar-label">{item.date.slice(5)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="resto-top">
                    <div className="resto-chart-title">Productos mas vendidos</div>
                    {topProducts.length === 0 ? (
                        <div className="resto-empty">No hay productos registrados en ventas.</div>
                    ) : (
                        <div className="resto-top-list">
                            {topProducts.map((item, index) => (
                                <div key={item.productId} className="resto-top-item">
                                    <div className="resto-rank">{index + 1}</div>
                                    <div>
                                        <div className="resto-top-name">{item.productName}</div>
                                        <div className="resto-muted">{item.quantitySold} vendidos · Bs {formatMoney(item.totalSales)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .resto-filter {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(180px, 1fr)) auto;
                    gap: 12px;
                    align-items: end;
                    background: #ffffff;
                    border: 1px solid #ebe1d5;
                    border-radius: 16px;
                    padding: 16px;
                    box-shadow: 0 18px 38px -30px rgba(33, 26, 21, 0.36);
                }
                .resto-label {
                    font-size: 0.75rem;
                    color: #8c8178;
                    display: block;
                    margin-bottom: 6px;
                }
                .resto-input {
                    width: 100%;
                    background: #faf5ee;
                    border: 1px solid #ebe1d5;
                    border-radius: 10px;
                    color: #211a15;
                    padding: 8px 10px;
                }
                .resto-btn {
                    background: #e4531f;
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    padding: 10px 16px;
                    font-weight: 700;
                }
                .resto-metrics {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(160px, 1fr));
                    gap: 16px;
                }
                .resto-metric {
                    background: #ffffff;
                    border: 1px solid #ebe1d5;
                    border-radius: 16px;
                    padding: 16px;
                    box-shadow: 0 18px 38px -30px rgba(33, 26, 21, 0.36);
                }
                .resto-metric-label {
                    color: #8c8178;
                    font-size: 0.8rem;
                }
                .resto-metric-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-top: 6px;
                    color: #211a15;
                }
                .resto-metric-sub {
                    color: #8c8178;
                    font-size: 0.75rem;
                }
                .resto-reports-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 18px;
                }
                .resto-chart,
                .resto-top {
                    background: #ffffff;
                    border: 1px solid #ebe1d5;
                    border-radius: 16px;
                    padding: 16px;
                    box-shadow: 0 18px 38px -30px rgba(33, 26, 21, 0.36);
                }
                .resto-chart-title {
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: #211a15;
                }
                .resto-chart-bars {
                    display: flex;
                    align-items: flex-end;
                    gap: 12px;
                    height: 180px;
                }
                .resto-bar {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                }
                .resto-bar-value {
                    width: 100%;
                    border-radius: 10px;
                    background: #e4531f;
                    min-height: 16px;
                }
                .resto-bar-label {
                    font-size: 0.7rem;
                    color: #8c8178;
                }
                .resto-top-list {
                    display: grid;
                    gap: 10px;
                }
                .resto-top-item {
                    display: grid;
                    grid-template-columns: 28px 1fr;
                    gap: 10px;
                    align-items: center;
                    background: #faf5ee;
                    border: 1px solid #ebe1d5;
                    padding: 10px;
                    border-radius: 12px;
                }
                .resto-rank {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #ffeee4;
                    display: grid;
                    place-items: center;
                    color: #c23d12;
                    font-weight: 700;
                }
                .resto-top-name {
                    font-weight: 600;
                    color: #211a15;
                }
                .resto-muted {
                    color: #8c8178;
                }
                .resto-empty {
                    color: #8c8178;
                }
                @media (max-width: 1024px) {
                    .resto-metrics {
                        grid-template-columns: repeat(2, minmax(160px, 1fr));
                    }
                    .resto-reports-grid {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 640px) {
                    .resto-filter {
                        grid-template-columns: 1fr;
                    }
                    .resto-metrics {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </AdminShell>
    );
}