import { useEffect, useState } from "react";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useAuth } from "../../hooks/useAuth";
import { getAuditLogs, getGlobalSales, getTopRestaurants } from "../../services/reportsApi";

const gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

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
    const [auditLogs, setAuditLogs] = useState([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const loadReports = async () => {
        setBusy(true);
        setError("");
        try {
            const from = startOfDayIso(fromDate);
            const to = endOfDayIso(toDate);
            const [globalData, restaurantsData, logsData] = await Promise.all([
                getGlobalSales(from, to),
                getTopRestaurants(from, to, 5),
                getAuditLogs()
            ]);
            setGlobalSales(globalData);
            setTopRestaurants(restaurantsData);
            setAuditLogs(logsData);
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
            <div className="min-vh-100 w-100 d-flex align-items-center justify-content-center text-white" style={{ background: gradient }}>
                <div className="spinner-border me-2" role="status"></div>
                <p className="mb-0 fw-bold">Cargando reportes globales...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-vh-100 w-100 d-flex flex-column" style={{ background: gradient }}>
            <DashboardNavbar />

            <main className="container py-5 flex-grow-1">
                <div className="text-white mb-4">
                    <h1 className="display-5 fw-bold mb-2">Reportes Globales</h1>
                    <p className="mb-0 text-white-50">Ventas totales, restaurantes activos y auditoria de plataforma.</p>
                </div>

                {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white">{error}</div>}

                <div className="card border-0 shadow-lg text-white mb-4"
                     style={{ background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
                    <div className="card-body">
                        <div className="row g-3 align-items-end">
                            <div className="col-12 col-md-4">
                                <label className="form-label small text-white-50">Desde</label>
                                <input className="form-control" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label small text-white-50">Hasta</label>
                                <input className="form-control" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                            </div>
                            <div className="col-12 col-md-4">
                                <button className="btn btn-light w-100 fw-bold" onClick={loadReports} disabled={busy}>
                                    Consultar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-12 col-md-4">
                        <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 text-white shadow-sm"
                             style={{ backdropFilter: "blur(10px)", borderRadius: "15px" }}>
                            <div className="card-body">
                                <p className="small text-white-50 mb-1">Ventas totales</p>
                                <h2 className="fw-bold mb-0">S/ {formatMoney(globalSales?.totalSales)}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 text-white shadow-sm"
                             style={{ backdropFilter: "blur(10px)", borderRadius: "15px" }}>
                            <div className="card-body">
                                <p className="small text-white-50 mb-1">Pedidos vendidos</p>
                                <h2 className="fw-bold mb-0">{globalSales?.ordersCount || 0}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 text-white shadow-sm"
                             style={{ backdropFilter: "blur(10px)", borderRadius: "15px" }}>
                            <div className="card-body">
                                <p className="small text-white-50 mb-1">Restaurantes activos</p>
                                <h2 className="fw-bold mb-0">{globalSales?.restaurantsCount || 0}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-12 col-lg-6">
                        <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 text-white shadow-sm"
                             style={{ backdropFilter: "blur(10px)", borderRadius: "15px" }}>
                            <div className="card-body">
                                <h2 className="h5 fw-bold mb-3">Restaurantes mas activos</h2>
                                {topRestaurants.length === 0 ? (
                                    <p className="text-white-50">No hay ventas en el periodo.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {topRestaurants.map((restaurant) => (
                                            <div key={restaurant.restaurantId} className="p-3 rounded" style={{ background: "rgba(0,0,0,0.25)" }}>
                                                <div className="fw-bold text-break">{restaurant.restaurantId}</div>
                                                <div className="d-flex justify-content-between text-white-50 small">
                                                    <span>{restaurant.ordersCount} pedidos</span>
                                                    <span>S/ {formatMoney(restaurant.totalSales)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-6">
                        <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 text-white shadow-sm"
                             style={{ backdropFilter: "blur(10px)", borderRadius: "15px" }}>
                            <div className="card-body">
                                <h2 className="h5 fw-bold mb-3">Auditoria global</h2>
                                {auditLogs.length === 0 ? (
                                    <p className="text-white-50">No hay eventos de auditoria.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-2" style={{ maxHeight: "420px", overflowY: "auto" }}>
                                        {auditLogs.slice(0, 15).map((log) => (
                                            <div key={log.id} className="p-3 rounded" style={{ background: "rgba(0,0,0,0.25)" }}>
                                                <div className="fw-bold">{log.action}</div>
                                                <small className="text-white-50 d-block">{log.source} · {new Date(log.occurredAt).toLocaleString()}</small>
                                                <small className="text-white-50 text-break">{log.restaurantId || "global"}</small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
