import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getPublicRestaurantes } from "../../services/api";

export default function Home() {
    const [restaurantes, setRestaurantes] = useState([]);
    const [loadingRestaurantes, setLoadingRestaurantes] = useState(true);

    useEffect(() => {
        const loadRestaurantes = async () => {
            try {
                const data = await getPublicRestaurantes();
                setRestaurantes(data);
            } catch (error) {
                console.error("Error loading restaurantes:", error);
            } finally {
                setLoadingRestaurantes(false);
            }
        };
        loadRestaurantes();
    }, []);

    return (
        <div className="min-vh-100 d-flex flex-column text-white landing-root">
            <Navbar />

            <main className="flex-grow-1">
                {/* Hero */}
                <section className="container py-5 py-lg-6">
                    <div className="row g-5 align-items-center">
                        <div className="col-12 col-lg-6">
                            <span className="badge rounded-pill px-3 py-2 hero-pill">
                                • Multi-restaurante · Sin delivery
                            </span>
                            <h1 className="display-3 fw-bold mt-4 hero-title">
                                Tu menú digital,
                                <span className="hero-accent"> listo en un escaneo.</span>
                            </h1>
                            <p className="hero-subtitle mt-4">
                                Tus clientes escanean el QR de la mesa, arman su pedido, pagan en caja o
                                por QR simulado y siguen el estado en tiempo real. Tú controlas todo desde tu panel.
                            </p>
                            <div className="d-flex flex-wrap gap-3 mt-4">
                                <Link to="/register" className="btn btn-primary rounded-pill px-4 hero-cta">
                                    Probar demo gratis →
                                </Link>
                                <a href="#como-funciona" className="btn btn-outline-light rounded-pill px-4 hero-ghost">
                                    Ver cómo funciona
                                </a>
                            </div>
                            <div className="d-flex gap-5 mt-5 hero-stats">
                                <div>
                                    <div className="h3 fw-bold text-danger mb-0">2+</div>
                                    <small className="text-white-50">Restaurantes demo</small>
                                </div>
                                <div>
                                    <div className="h3 fw-bold text-danger mb-0">15+</div>
                                    <small className="text-white-50">Productos cargados</small>
                                </div>
                                <div>
                                    <div className="h3 fw-bold text-danger mb-0">4</div>
                                    <small className="text-white-50">Estados en vivo</small>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-6">
                            <div className="hero-gallery">
                                <div className="hero-main">
                                    <img src="/hamburguesa.jpeg" alt="Hamburguesa" />
                                </div>
                                <div className="hero-right">
                                    <img src="/PhoneMenu.jpeg" alt="Menu en telefono" />
                                    <img src="/QRMesa.jpeg" alt="QR de mesa" />
                                </div>
                                <div className="hero-card">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="status-dot"></div>
                                        <div>
                                            <small className="text-white-50">Pedido #A47</small>
                                            <div className="fw-semibold">Preparando · 4 ítems</div>
                                        </div>
                                    </div>
                                    <div className="status-bars">
                                        <span className="active"></span>
                                        <span className="active"></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Funciones */}
                <section id="funciones" className="section-block section-block--dark">
                    <div className="container py-5">
                    <div className="mb-4">
                        <span className="text-uppercase small hero-accent">Funcionalidades</span>
                        <h2 className="section-title mt-2">
                            Todo lo que tu restaurante necesita,
                            <span className="hero-accent"> nada de delivery.</span>
                        </h2>
                    </div>

                    <div className="row g-4">
                        {[
                            {
                                title: "QR por mesa",
                                desc: "Cada mesa con su propio QR. El cliente entra directo al menú sin instalar nada.",
                                icon: "fa-solid fa-qrcode",
                            },
                            {
                                title: "Carrito con extras",
                                desc: "Categorías, productos, opciones y modificadores. Todo se calcula al instante.",
                                icon: "fa-solid fa-cart-shopping",
                            },
                            {
                                title: "Pagos flexibles",
                                desc: "Cobra en caja (efectivo o tarjeta) o con QR online simulado. Tú decides.",
                                icon: "fa-solid fa-credit-card",
                            },
                            {
                                title: "Tablero de cocina",
                                desc: "Pedidos en vivo: RECIBIDO → PREPARANDO → LISTO → ENTREGADO en un click.",
                                icon: "fa-solid fa-utensils",
                            },
                            {
                                title: "Comprobantes",
                                desc: "Boleta o factura simulada generada automáticamente al confirmar el pago.",
                                icon: "fa-solid fa-receipt",
                            },
                            {
                                title: "Reportes diarios",
                                desc: "Ventas por día, productos más vendidos y resumen por restaurante.",
                                icon: "fa-solid fa-chart-line",
                            },
                            {
                                title: "Multi-tenant seguro",
                                desc: "Roles cliente, restaurante y admin. Cada negocio ve solo lo suyo. JWT.",
                                icon: "fa-solid fa-shield-halved",
                            },
                            {
                                title: "100% responsive",
                                desc: "Diseñado mobile-first. Funciona perfecto en celular y desktop por igual.",
                                icon: "fa-solid fa-mobile-screen",
                            },
                        ].map((item) => (
                            <div key={item.title} className="col-12 col-md-6 col-lg-3">
                                <div className="feature-tile">
                                    <div className="feature-icon"><i className={item.icon}></i></div>
                                    <h3>{item.title}</h3>
                                    <p>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                </section>

                {/* Como funciona */}
                <section id="como-funciona" className="section-block section-block--darker">
                    <div className="container py-5">
                    <div className="row g-4 align-items-center mb-4">
                        <div className="col-12 col-lg-7">
                            <span className="text-uppercase small hero-accent">Flujo del cliente</span>
                            <h2 className="section-title mt-2">
                                Del QR al plato en <span className="hero-accent">4 pasos.</span>
                            </h2>
                        </div>
                        <div className="col-12 col-lg-5">
                            <p className="section-subtitle mb-0">
                                Sin apps, sin cuentas, sin fricción. Una experiencia pensada
                                para mesa o para llevar.
                            </p>
                        </div>
                    </div>

                    <div className="row g-4">
                        {[
                            {
                                number: "01",
                                title: "Escanea el QR",
                                desc: "El cliente apunta la cámara y abre el menú de tu restaurante al instante.",
                            },
                            {
                                number: "02",
                                title: "Arma el pedido",
                                desc: "Elige categorías, productos y extras. El carrito calcula totales en vivo.",
                            },
                            {
                                number: "03",
                                title: "Paga como prefiera",
                                desc: "Caja presencial o QR online simulado. El pedido obtiene un código único.",
                            },
                            {
                                number: "04",
                                title: "Sigue el estado",
                                desc: "RECIBIDO, PREPARANDO, LISTO, ENTREGADO. Y descarga su comprobante.",
                            },
                        ].map((step, index) => (
                            <div key={step.number} className="col-12 col-md-6 col-lg-3 flow-step">
                                <div className="flow-card">
                                    <div className="flow-number">{step.number}</div>
                                    <h4>{step.title}</h4>
                                    <p>{step.desc}</p>
                                </div>
                                {index < 3 && <div className="flow-arrow">→</div>}
                            </div>
                        ))}
                    </div>
                    </div>
                </section>


                {/* Restaurantes */}
                <section id="restaurantes" className="py-5" style={{ background: 'radial-gradient(circle at 80% 30%, rgba(240,85,77,0.25) 0%, transparent 55%), radial-gradient(circle at 10% 80%, rgba(240,85,77,0.15) 0%, transparent 45%), linear-gradient(160deg, #1a0606 0%, #2a0a0a 50%, #150505 100%)', borderTop: '1px solid rgba(240,85,77,0.3)' }}>
                    <div className="container">
                    <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
                        <div>
                            <h2 className="section-title hero-accent">Restaurantes destacados</h2>
                            <p className="text-white-50">Elige tu favorito y disfruta.</p>
                        </div>
                    </div>

                    {loadingRestaurantes ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-light" role="status"></div>
                        </div>
                    ) : restaurantes.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-white-50">No hay restaurantes disponibles</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {restaurantes.map(rest => (
                                <div key={rest.id} className="col-12 col-sm-6 col-lg-4">
                                    <div className="card h-100 restaurant-card">
                                        <div className="card-body text-center p-4">
                                            <div className="mb-3">
                                                {rest.logo ? (
                                                    <img
                                                        src={`http://localhost:8000${rest.logo}`}
                                                        alt={`Logo de ${rest.name}`}
                                                        className="rounded-circle"
                                                        style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid rgba(240,85,77,0.5)' }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = '<span style="font-size: 3rem">🏪</span>';
                                                        }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '3rem' }}></span>
                                                )}
                                            </div>
                                            <h3 className="h5 fw-bold mb-2 hero-accent">{rest.name}</h3>
                                            <p className="text-white-50 small mb-3">
                                                {rest.address || "Ubicación no especificada"}
                                            </p>
                                            <Link to={`/restaurante/${rest.id}/menu`} className="btn rounded-pill px-4" style={{ background: 'linear-gradient(135deg, #f0554d 0%, #d73a35 100%)', color: '#fff', border: 'none' }}>
                                                Ver Menú →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    </div>
                </section>

            </main>

            <footer className="footer">
                <div className="container text-center">
                    <p className="text-white-50 mb-1 small">© 2026 RestoSys - Todos los derechos reservados</p>
                    <div className="small text-white-50">
                        <span>Luis Alfredo Vargas Pizarro</span> | <span>Eduardo Durana</span>
                    </div>
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

                .landing-root {
                    background: radial-gradient(circle at 20% 20%, rgba(255, 64, 64, 0.35), transparent 45%),
                        radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.08), transparent 35%),
                        linear-gradient(180deg, #0b090a 0%, #1b0a0a 45%, #070606 100%);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
                .hero-title {
                    font-family: 'Space Grotesk', sans-serif;
                    line-height: 1.05;
                }
                .hero-accent {
                    color: #f0554d;
                }
                .hero-subtitle {
                    color: rgba(255, 255, 255, 0.75);
                    max-width: 540px;
                }
                .hero-pill {
                    background: rgba(240, 85, 77, 0.15);
                    color: #f0554d;
                    border: 1px solid rgba(240, 85, 77, 0.35);
                }
                .hero-cta {
                    background: linear-gradient(135deg, #f0554d 0%, #d73a35 100%);
                    border: none;
                }
                .hero-ghost {
                    color: #fff;
                }
                .hero-stats .h3 {
                    font-family: 'Space Grotesk', sans-serif;
                }
                .hero-gallery {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 20px;
                    position: relative;
                }
                .hero-main img,
                .hero-right img {
                    width: 100%;
                    border-radius: 22px;
                    object-fit: cover;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
                }
                .hero-main {
                    border-radius: 24px;
                    overflow: hidden;
                }
                .hero-right {
                    display: grid;
                    gap: 20px;
                }
                .hero-card {
                    position: absolute;
                    left: 10%;
                    bottom: -20px;
                    background: rgba(20, 20, 20, 0.85);
                    border-radius: 18px;
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    gap: 24px;
                    min-width: 260px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(8px);
                }
                .status-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #f0554d;
                    box-shadow: 0 0 12px rgba(240, 85, 77, 0.7);
                }
                .status-bars {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 6px;
                    align-items: center;
                }
                .status-bars span {
                    height: 6px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.15);
                }
                .status-bars .active {
                    background: #f0554d;
                }
                .section-title {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 2rem;
                }
                .section-subtitle {
                    color: rgba(255, 255, 255, 0.65);
                }
                .section-block {
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                }
                .section-block--dark {
                    background: radial-gradient(circle at 90% 50%, rgba(240, 85, 77, 0.12) 0%, transparent 60%), rgba(22, 8, 8, 0.92);
                }
                .section-block--darker {
                    background: radial-gradient(circle at 10% 50%, rgba(240, 85, 77, 0.1) 0%, transparent 55%), rgba(18, 6, 6, 0.96);
                }
                .feature-tile {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 18px;
                    padding: 22px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
                }
                .feature-tile h3 {
                    font-size: 1.05rem;
                    margin-bottom: 0;
                }
                .feature-tile p {
                    color: rgba(255, 255, 255, 0.65);
                    font-size: 0.9rem;
                    margin-bottom: 0;
                }
                .feature-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    background: rgba(240, 85, 77, 0.2);
                    color: #f0554d;
                    display: grid;
                    place-items: center;
                    font-weight: 700;
                }
                .step-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 18px;
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .step-card span {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #f0554d;
                }
                .flow-card {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 24px;
                    min-height: 220px;
                    position: relative;
                }
                .flow-step {
                    position: relative;
                }
                .flow-number {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #f0554d;
                    margin-bottom: 12px;
                }
                .flow-card h4 {
                    font-size: 1.05rem;
                    margin-bottom: 10px;
                }
                .flow-card p {
                    color: rgba(255, 255, 255, 0.65);
                    font-size: 0.9rem;
                }
                .flow-arrow {
                    display: none;
                }
                @media (min-width: 992px) {
                    .flow-arrow {
                        display: block;
                        position: absolute;
                        top: 50%;
                        right: -12px;
                        transform: translate(50%, -50%);
                        color: rgba(240, 85, 77, 0.6);
                        font-size: 1.3rem;
                    }
                }
                .arch-card {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .restaurant-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 18px;
                    backdrop-filter: blur(10px);
                }
                .plan-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 18px;
                    padding: 24px;
                    text-align: left;
                }
                .plan-card.featured {
                    border-color: rgba(240, 85, 77, 0.6);
                    box-shadow: 0 18px 40px rgba(240, 85, 77, 0.25);
                }
                .plan-price {
                    display: inline-block;
                    margin-top: 16px;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #f0554d;
                }
                .footer {
                    background: linear-gradient(135deg, rgba(30, 8, 8, 0.95) 0%, rgba(15, 5, 5, 0.98) 100%);
                    border-top: 1px solid rgba(240, 85, 77, 0.2);
                    padding: 24px 0;
                }
                @media (max-width: 991px) {
                    .hero-gallery {
                        grid-template-columns: 1fr;
                    }
                    .hero-card {
                        position: static;
                        margin-top: 16px;
                    }
                }
            `}</style>
        </div>
    );
}