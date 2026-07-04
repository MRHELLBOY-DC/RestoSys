import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../hooks/useAuth";
import RestauranteShell from "../../components/RestauranteShell";

export default function RestauranteDashboard() {
    const { user, loading } = useAuth(['empleado']);
    const navigate = useNavigate();

    // Determinar si es Admin Restaurante para mostrar opciones adicionales
    const isAdminRestaurante = user?.role === 'restaurante';

    if (loading) {
        return (
            <RestauranteShell title="Panel del restaurante" subtitle="Cargando panel...">
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
                    <div className="spinner-border me-2" style={{ color: '#e4531f' }} role="status"></div>
                    <p className="mb-0 fw-bold">Cargando panel...</p>
                </div>
            </RestauranteShell>
        );
    }

    if (!user) return null;

    return (
        <RestauranteShell
            title="Panel del restaurante"
            subtitle={user.restaurant?.name || "Establecimiento no asignado"}
        >

            {user.restaurant?.id && (
                <div className="resto-dashboard-card">
                    <div className="resto-qr">
                        <div className="resto-qr-label">Menu digital</div>
                        <div className="resto-qr-box">
                            <QRCodeSVG
                                value={`${window.location.origin}/restaurante/${user.restaurant.id}/menu`}
                                size={160}
                                bgColor="#ffffff"
                                fgColor="#111111"
                                level="M"
                            />
                        </div>
                    </div>
                    <div className="resto-qr-text">
                        Comparte este QR en las mesas para abrir el menu del restaurante.
                    </div>
                </div>
            )}

            <div className="resto-dashboard-grid">
                {/* Gestión de productos - SOLO visible para Admin Restaurante */}
                {isAdminRestaurante && (
                    <button className="resto-dashboard-tile" type="button" onClick={() => navigate("/restaurante/menu")}>
                        <div className="resto-tile-title">Gestion de productos</div>
                        <div className="resto-tile-text">Actualiza menu, precios y categorias.</div>
                    </button>
                )}
                
                <button className="resto-dashboard-tile" type="button" onClick={() => navigate("/restaurante/pedidos")}>
                    <div className="resto-tile-title">Pedidos activos</div>
                    <div className="resto-tile-text">Monitorea y despacha ordenes.</div>
                </button>
                
                <button className="resto-dashboard-tile" type="button" onClick={() => navigate("/restaurante/pagos")}>
                    <div className="resto-tile-title">Pagos y facturacion</div>
                    <div className="resto-tile-text">Pagos en caja, QR y comprobantes.</div>
                </button>
                
                {/* Reportes - SOLO visible para Admin Restaurante */}
                {isAdminRestaurante && (
                    <button className="resto-dashboard-tile" type="button" onClick={() => navigate("/restaurante/reportes")}>
                        <div className="resto-tile-title">Reportes</div>
                        <div className="resto-tile-text">Metricas de rendimiento y crecimiento.</div>
                    </button>
                )}
            </div>

            <style>{`
                .resto-dashboard-card {
                    background: #ffffff;
                    border: 1px solid #ebe1d5;
                    border-radius: 18px;
                    padding: 18px;
                    display: grid;
                    grid-template-columns: auto 1fr;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 18px 38px -30px rgba(33, 26, 21, 0.36);
                }
                .resto-qr {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    align-items: center;
                }
                .resto-qr-label {
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: #211a15;
                }
                .resto-qr-box {
                    background: #fff;
                    padding: 10px;
                    border-radius: 12px;
                    border: 1px solid #ebe1d5;
                }
                .resto-qr-text {
                    color: #8c8178;
                }
                .resto-dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
                    gap: 12px;
                }
                .resto-dashboard-tile {
                    background: #ffffff;
                    border: 1px solid #ebe1d5;
                    border-radius: 16px;
                    padding: 16px;
                    text-align: left;
                    color: #211a15;
                    transition: transform 0.2s ease, border 0.2s ease, box-shadow 0.2s ease;
                    position: relative;
                    box-shadow: 0 18px 38px -30px rgba(33, 26, 21, 0.36);
                }
                .resto-dashboard-tile:hover {
                    transform: translateY(-4px);
                    border-color: #e4531f;
                    box-shadow: 0 22px 44px -30px rgba(228, 83, 31, 0.5);
                }
                .resto-tile-title {
                    font-weight: 700;
                    margin-bottom: 6px;
                    color: #211a15;
                }
                .resto-tile-text {
                    color: #8c8178;
                    font-size: 0.85rem;
                }
                @media (max-width: 700px) {
                    .resto-dashboard-card {
                        grid-template-columns: 1fr;
                        text-align: center;
                    }
                }
            `}</style>
        </RestauranteShell>
    );
}