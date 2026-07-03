import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { getPublicRestaurantes } from "../../services/api";
import { authMediaUrl } from "../../services/mediaUrl";

export default function ClienteDashboard() {
    const { user, loading } = useAuth(['cliente']);
    const navigate = useNavigate();
    const [restaurantes, setRestaurantes] = useState([]);
    const [loadingRest, setLoadingRest] = useState(true);

    useEffect(() => {
        getPublicRestaurantes()
            .then(data => setRestaurantes(data))
            .catch(() => {})
            .finally(() => setLoadingRest(false));
    }, []);

    const bg = 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)';

    if (loading) return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: bg }}>
            <Navbar />
            <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                <div className="spinner-border text-light me-3" role="status"></div>
                <span className="h5 mb-0">Cargando...</span>
            </div>
        </div>
    );

    if (!user) return null;

    const displayName = user.full_name?.trim() || user.username || user.email || "";

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: bg }}>
            <Navbar />

            <div className="container py-5 flex-grow-1">
                {/* Bienvenida */}
                <div className="mb-5">
                    <h1 className="text-white fw-bold display-5 mb-1">¡Hola, {displayName}!</h1>
                    <p className="text-white-50">Elige un restaurante y arma tu pedido</p>
                </div>

                {/* Accesos rápidos */}
                <div className="row g-3 mb-5">
                    {[
                        { title: "Mi Carrito", icon: "fa-cart-shopping", path: "/carrito", desc: "Revisa tu selección" },
                        { title: "Mis Pedidos", icon: "fa-receipt", path: "/mis-pedidos", desc: "Estado de tus órdenes" },
                    ].map((action, i) => (
                        <div key={i} className="col-6 col-md-3">
                            <div className="text-center p-3 h-100"
                                 onClick={() => navigate(action.path)}
                                 style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(240,85,77,0.2)', borderRadius: '18px', cursor: 'pointer', transition: 'all 0.2s' }}
                                 onMouseOver={e => e.currentTarget.style.background = 'rgba(240,85,77,0.1)'}
                                 onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                <i className={`fa-solid ${action.icon} fa-xl mb-2 d-block`} style={{ color: '#f0554d' }}></i>
                                <div className="text-white fw-semibold small">{action.title}</div>
                                <div className="text-white-50" style={{ fontSize: '0.75rem' }}>{action.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Restaurantes disponibles */}
                <div>
                    <h4 className="text-white fw-bold mb-1">
                        <i className="fa-solid fa-store me-2" style={{ color: '#f0554d' }}></i>
                        Restaurantes disponibles
                    </h4>
                    <p className="text-white-50 small mb-4">Selecciona uno para ver su menú y hacer tu pedido</p>

                    {loadingRest ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-light" role="status"></div>
                        </div>
                    ) : restaurantes.length === 0 ? (
                        <div className="text-center py-5 text-white-50">
                            <i className="fa-solid fa-store-slash fa-2x mb-3 d-block"></i>
                            No hay restaurantes disponibles por ahora
                        </div>
                    ) : (
                        <div className="row g-4">
                            {restaurantes.map(rest => (
                                <div key={rest.id} className="col-12 col-sm-6 col-lg-4">
                                    <div className="h-100 p-4 text-center"
                                         onClick={() => navigate(`/restaurante/${rest.id}/menu`)}
                                         style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(240,85,77,0.2)', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.25s' }}
                                         onMouseOver={e => { e.currentTarget.style.background = 'rgba(240,85,77,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                         onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                        <div className="mb-3">
                                            {rest.logo ? (
                                                <img src={authMediaUrl(rest.logo)} alt={rest.name}
                                                     className="rounded-circle"
                                                     style={{ width: '72px', height: '72px', objectFit: 'cover', border: '2px solid rgba(240,85,77,0.5)' }}
                                                     onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<i class="fa-solid fa-store fa-2x" style="color:#f0554d"></i>'; }} />
                                            ) : (
                                                <i className="fa-solid fa-store fa-2x" style={{ color: '#f0554d' }}></i>
                                            )}
                                        </div>
                                        <h5 className="fw-bold mb-1" style={{ color: '#f0554d' }}>{rest.name}</h5>
                                        <p className="text-white-50 small mb-3">{rest.address || "Ver menú"}</p>
                                        <span className="badge rounded-pill px-3 py-2"
                                              style={{ background: 'rgba(240,85,77,0.15)', border: '1px solid rgba(240,85,77,0.35)', color: '#f0554d' }}>
                                            Ver Menú →
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
