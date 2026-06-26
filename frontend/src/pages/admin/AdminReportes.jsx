import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { useAuth } from "../../hooks/useAuth";
import { getGlobalSales, getTopRestaurants } from "../../services/reportsApi";
import { getAdminRestaurantes } from "../../services/api";

const toDateInput = (date) => date.toISOString().slice(0, 10);
const startOfDayIso = (dateText) => `${dateText}T00:00:00.000Z`;
const endOfDayIso = (dateText) => `${dateText}T23:59:59.999Z`;

const formatMoney = (value) => {
    const number = Number(value);
    return Number.isNaN(number) ? "0.00" : number.toFixed(2);
};

const getErrorMessage = (err, fallback) => err?.data?.detail || err?.data?.message || err?.message || fallback;

export default function AdminReportes() {
    const { user, loading } = useAuth(["admin"]);
    const today = toDateInput(new Date());
    const sevenDaysAgo = toDateInput(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

    const [fromDate, setFromDate] = useState(sevenDaysAgo);
    const [toDate, setToDate] = useState(today);
    const [globalSales, setGlobalSales] = useState(null);
    const [topRestaurants, setTopRestaurants] = useState([]);
    const [restaurantMap, setRestaurantMap] = useState(new Map());
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const loadReports = async () => {
        setBusy(true);
        setError("");
        try {
            const from = startOfDayIso(fromDate);
            const to = endOfDayIso(toDate);
            const [globalData, restaurantsData, allRestaurants] = await Promise.all([
                getGlobalSales(from, to),
                getTopRestaurants(from, to, 5),
                getAdminRestaurantes().catch(() => []),
            ]);
            setGlobalSales(globalData);
            setTopRestaurants(restaurantsData);
            const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, "0")}`;
            setRestaurantMap(new Map((Array.isArray(allRestaurants) ? allRestaurants : []).map(r => [toUUID(r.id), r.name])));
        } catch (err) {
            setError(getErrorMessage(err, "No se pudieron cargar los reportes globales"));
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        loadReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="d-flex align-items-center gap-2">
                    <div className="spinner-border" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando reportes globales...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <AdminShell
            title="Reportes globales"
            subtitle="Ventas totales y restaurantes mas activos en el periodo."
        >
            {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white">{error}</div>}

            <div className="admin-card admin-card--glass" style={{ marginBottom: "24px" }}>
                <div className="row g-3 align-items-end">
                    <div className="col-12 col-md-4">
                        <label className="form-label small text-white-50">Desde</label>
                        <input className="form-control admin-input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="col-12 col-md-4">
                        <label className="form-label small text-white-50">Hasta</label>
                        <input className="form-control admin-input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <div className="col-12 col-md-4">
                        <button className="admin-btn admin-btn-primary w-100" onClick={loadReports} disabled={busy}>
                            Consultar
                        </button>
                    </div>
                </div>
            </div>

            <div className="admin-grid admin-grid-3" style={{ marginBottom: "24px" }}>
                <div className="admin-card admin-card--glass">
                    <p className="admin-stat-label">Ventas totales</p>
                    <div className="admin-stat-value">S/ {formatMoney(globalSales?.totalSales)}</div>
                </div>
                <div className="admin-card admin-card--glass">
                    <p className="admin-stat-label">Pedidos vendidos</p>
                    <div className="admin-stat-value">{globalSales?.ordersCount || 0}</div>
                </div>
                <div className="admin-card admin-card--glass">
                    <p className="admin-stat-label">Restaurantes activos</p>
                    <div className="admin-stat-value">{globalSales?.restaurantsCount || 0}</div>
                </div>
            </div>

            <div className="admin-card admin-card--glass">
                <h2 className="h5 fw-bold mb-3">Restaurantes mas activos</h2>
                {topRestaurants.length === 0 ? (
                    <p className="text-white-50">No hay ventas en el periodo.</p>
                ) : (
                    <div className="admin-list">
                        {topRestaurants.map((restaurant, index) => (
                            <div key={restaurant.restaurantId} className="admin-list-item">
                                <div className="admin-list-rank">{index + 1}</div>
                                <div>
                                    <div className="fw-bold text-break">{restaurantMap.get(restaurant.restaurantId) || restaurant.restaurantId}</div>
                                    <small className="text-white-50">{restaurant.ordersCount} pedidos</small>
                                    <div className="admin-list-bar">
                                        <span style={{ width: `${Math.min(100, restaurant.ordersCount || 1)}%` }} />
                                    </div>
                                </div>
                                <div className="admin-list-value">S/ {formatMoney(restaurant.totalSales)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminShell>
    );
}