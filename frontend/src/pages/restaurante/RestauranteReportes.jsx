import { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useAuth } from "../../hooks/useAuth";
import { getSalesByDay, getTopProducts } from "../../services/reportsApi";

const adminGradient = "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)";

const toDateInput = (date) => date.toISOString().slice(0, 10);
const startOfDayIso = (dateText) => `${dateText}T00:00:00.000Z`;
const endOfDayIso = (dateText) => `${dateText}T23:59:59.999Z`;
const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, "0")}`;

const formatMoney = (value) => {
    const number = Number(value);
    return Number.isNaN(number) ? "0.00" : number.toFixed(2);
};

const getErrorMessage = (err, fallback) => err?.data?.detail || err?.data?.message || err?.message || fallback;

export default function RestauranteReportes() {
    const { user, loading } = useAuth(["restaurante"]);
    const today = toDateInput(new Date());
    const sevenDaysAgo = toDateInput(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

    const [fromDate, setFromDate] = useState(sevenDaysAgo);
    const [toDate, setToDate] = useState(today);
    const [salesByDay, setSalesByDay] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
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
            const [salesData, productsData] = await Promise.all([
                getSalesByDay(restaurantUuid, from, to),
                getTopProducts(restaurantUuid, from, to, 5)
            ]);
            setSalesByDay(salesData);
            setTopProducts(productsData);
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
            <div className="min-vh-100 d-flex flex-column" style={{ background: adminGradient }}>
                <DashboardNavbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                    <div className="spinner-border text-light me-2" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando reportes...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const totalPeriod = salesByDay.reduce((sum, item) => sum + Number(item.totalSales || 0), 0);
    const totalOrders = salesByDay.reduce((sum, item) => sum + Number(item.ordersCount || 0), 0);

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: adminGradient }}>
            <DashboardNavbar />
            <div className="container py-5">
                <div className="text-white mb-4">
                    <h1 className="display-5 fw-bold mb-2">Reportes del Restaurante</h1>
                    <p className="mb-0 opacity-75">Ventas por dia, productos mas vendidos y auditoria basica.</p>
                </div>

                {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white">{error}</div>}
                {success && <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white">{success}</div>}

                <div className="card border-0 shadow-lg text-white mb-4"
                     style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
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
                    <div className="col-12 col-md-6">
                        <div className="card border-0 shadow-lg text-white h-100"
                             style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
                            <div className="card-body">
                                <p className="small text-white-50 mb-1">Ventas del periodo</p>
                                <h2 className="fw-bold mb-0">S/ {formatMoney(totalPeriod)}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="card border-0 shadow-lg text-white h-100"
                             style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
                            <div className="card-body">
                                <p className="small text-white-50 mb-1">Pedidos vendidos</p>
                                <h2 className="fw-bold mb-0">{totalOrders}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-12 col-lg-6">
                        <div className="card border-0 shadow-lg text-white h-100"
                             style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
                            <div className="card-body">
                                <h2 className="h5 fw-bold mb-3">Ventas por dia</h2>
                                {salesByDay.length === 0 ? (
                                    <p className="opacity-75">No hay ventas en el periodo.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-dark table-borderless align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Pedidos</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {salesByDay.map((item) => (
                                                    <tr key={item.date}>
                                                        <td>{item.date}</td>
                                                        <td>{item.ordersCount}</td>
                                                        <td>S/ {formatMoney(item.totalSales)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-6">
                        <div className="card border-0 shadow-lg text-white h-100"
                             style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(12px)", borderRadius: "20px" }}>
                            <div className="card-body">
                                <h2 className="h5 fw-bold mb-3">Productos mas vendidos</h2>
                                {topProducts.length === 0 ? (
                                    <p className="opacity-75">No hay productos registrados en ventas.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {topProducts.map((item) => (
                                            <div key={item.productId} className="p-3 rounded" style={{ background: "rgba(0,0,0,0.25)" }}>
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <div className="fw-bold">{item.productName}</div>
                                                        <small className="opacity-75">{item.quantitySold} unidades</small>
                                                    </div>
                                                    <div className="fw-bold">S/ {formatMoney(item.totalSales)}</div>
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
