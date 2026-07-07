import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { useOrdersSocket } from "../../hooks/useOrdersSocket";
import { getPublicRestaurantes } from "../../services/api";
import { getOrdersByClient } from "../../services/ordersApi";
import { authMediaUrl } from "../../services/mediaUrl";
import "../../styles/client-theme.css";

const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, '0')}`;

export default function ClienteDashboard() {
    const { user, loading } = useAuth(['cliente']);
    const navigate = useNavigate();
    const [restaurantes, setRestaurantes] = useState([]);
    const [loadingRest, setLoadingRest] = useState(true);
    const [search, setSearch] = useState("");
    const [enCaminoOrder, setEnCaminoOrder] = useState(null);
    const [arrivalNotice, setArrivalNotice] = useState(null);

    useEffect(() => {
        getPublicRestaurantes()
            .then(data => setRestaurantes(data))
            .catch(() => {})
            .finally(() => setLoadingRest(false));
    }, []);

    const fetchEnCaminoOrder = () => {
        if (!user) return;
        getOrdersByClient(toUUID(user.id))
            .then(data => setEnCaminoOrder((data || []).find(p => p.type === 'DELIVERY' && p.status === 'EN_CAMINO') || null))
            .catch(() => {});
    };

    useEffect(() => {
        fetchEnCaminoOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useOrdersSocket({
        enabled: !!user,
        onConnect: fetchEnCaminoOrder,
        onOrderUpdate: (updated) => {
            setEnCaminoOrder(prev => {
                if (updated.type === 'DELIVERY' && updated.status === 'EN_CAMINO') return updated;
                if (prev?.id === updated.id) return null;
                return prev;
            });
        },
        onNotification: (notification) => setArrivalNotice(notification),
    });

    if (loading) return (
        <div className="client-shell d-flex flex-column">
            <Navbar />
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <div className="spinner-border me-3" style={{ color: '#e4531f' }} role="status"></div>
                <span className="fw-semibold client-muted">Cargando...</span>
            </div>
        </div>
    );

    if (!user) return null;

    const filteredRestaurantes = search.trim()
        ? restaurantes.filter(r => r.name.toLowerCase().includes(search.trim().toLowerCase()))
        : restaurantes;

    return (
        <div className="client-shell d-flex flex-column">
            <Navbar />

            <main className="container py-4 py-lg-5 flex-grow-1">
                {arrivalNotice && (
                    <div
                        className="alert border-0 mb-4 d-flex align-items-center justify-content-between gap-3"
                        style={{ background: '#f1e9fb', color: '#6f42c1', borderRadius: 14 }}
                    >
                        <span><i className="fa-solid fa-bell me-2" />{arrivalNotice.message} ({arrivalNotice.orderCode})</span>
                        <button type="button" className="btn-close" onClick={() => setArrivalNotice(null)} aria-label="Cerrar" />
                    </div>
                )}

                <section className="client-hero p-4 p-lg-5 mb-4">
                    <div className="row align-items-center g-4">
                        <div className="col-12 col-lg-7">
                            <div className="client-kicker mb-2">Cliente</div>
                            <h1 className="client-title display-6 mb-2">Donde quieres pedir hoy?</h1>
                            <p className="client-muted mb-0 fs-6">
                                Elegi un restaurante, revisa su menu y arma tu pedido desde la mesa.
                            </p>
                        </div>
                        <div className="col-12 col-lg-5">
                            <div className="row g-3">
                                {[
                                    { title: "Mi carrito", icon: "fa-cart-shopping", path: "/carrito", desc: "Revisa tu seleccion" },
                                    { title: "Mis pedidos", icon: "fa-receipt", path: "/mis-pedidos", desc: "Estado de tus ordenes" },
                                ].map((action) => (
                                    <div key={action.path} className="col-6">
                                        <button
                                            type="button"
                                            className="client-action w-100 text-start p-3 h-100"
                                            onClick={() => navigate(action.path)}
                                        >
                                            <span className="client-icon-box mb-3">
                                                <i className={`fa-solid ${action.icon}`}></i>
                                            </span>
                                            <span className="d-block fw-bold">{action.title}</span>
                                            <span className="d-block client-muted small">{action.desc}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {enCaminoOrder && (
                    <section
                        className="client-card p-4 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
                        style={{ background: '#f1e9fb', border: '1px solid #d9c6f2' }}
                    >
                        <div>
                            <div className="client-kicker mb-1" style={{ color: '#6f42c1' }}>Delivery en camino</div>
                            <h2 className="h5 mb-1" style={{ color: '#6f42c1' }}>Tu pedido {enCaminoOrder.orderCode} va en camino</h2>
                            <p className="client-muted mb-0 small">{enCaminoOrder.deliveryAddress}</p>
                        </div>
                        <button
                            onClick={() => navigate(`/mis-pedidos/${enCaminoOrder.id}/ruta`)}
                            className="btn fw-semibold px-4 py-2 d-inline-flex align-items-center gap-2"
                            style={{ background: '#6f42c1', color: '#fff', border: 'none', borderRadius: 12 }}
                        >
                            <i className="fa fa-route" />
                            Ver ruta en vivo
                        </button>
                    </section>
                )}

                <section>
                    <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
                        <div>
                            <div className="client-kicker mb-1">Paso 1</div>
                            <h2 className="client-title h3 mb-1">Elegir restaurante</h2>
                            <p className="client-muted mb-0">Selecciona uno para ver su menu y hacer tu pedido.</p>
                        </div>
                        <span className="client-pill px-3 py-2 align-self-start align-self-md-auto">
                            {restaurantes.length} disponibles
                        </span>
                    </div>

                    {restaurantes.length > 0 && (
                        <div className="mb-4" style={{ maxWidth: 380 }}>
                            <div className="position-relative">
                                <i className="fa-solid fa-magnifying-glass position-absolute" style={{ left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8c8178' }}></i>
                                <input
                                    type="text"
                                    className="form-control py-2 ps-5"
                                    placeholder="Buscar restaurante por nombre..."
                                    style={{ borderColor: '#ebe1d5', borderRadius: 999 }}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {loadingRest ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" style={{ color: '#e4531f' }} role="status"></div>
                        </div>
                    ) : restaurantes.length === 0 ? (
                        <div className="client-empty text-center py-5 client-muted">
                            <i className="fa-solid fa-store-slash fa-2x mb-3 d-block"></i>
                            No hay restaurantes disponibles por ahora
                        </div>
                    ) : filteredRestaurantes.length === 0 ? (
                        <div className="client-empty text-center py-5 client-muted">
                            <i className="fa-solid fa-magnifying-glass fa-2x mb-3 d-block"></i>
                            No encontramos restaurantes que coincidan con "{search}"
                        </div>
                    ) : (
                        <div className="row g-4">
                            {filteredRestaurantes.map(rest => (
                                <div key={rest.id} className="col-12 col-sm-6 col-lg-4">
                                    <button
                                        type="button"
                                        className="client-card h-100 w-100 p-0 text-start overflow-hidden d-flex flex-column"
                                        onClick={() => navigate(`/restaurante/${rest.id}/menu`)}
                                    >
                                        {rest.logo ? (
                                            <img
                                                src={authMediaUrl(rest.logo)}
                                                alt={rest.name}
                                                style={{ height: '160px', width: '100%', objectFit: 'cover' }}
                                                onError={e => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div style={{ height: '160px', background: '#ffeee4', color: '#e4531f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                                                <i className="fa-solid fa-store"></i>
                                            </div>
                                        )}
                                        <div className="p-4 flex-grow-1 d-flex flex-column">
                                            <h3 className="h5 client-title mb-1">{rest.name}</h3>
                                            <p className="client-muted small mb-3 flex-grow-1">{rest.address || "Menu disponible"}</p>
                                            <span className="client-pill px-3 py-2 d-inline-flex align-items-center gap-2 align-self-start">
                                                Ver menu <i className="fa-solid fa-arrow-right"></i>
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}