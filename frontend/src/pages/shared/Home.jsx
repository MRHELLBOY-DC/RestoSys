import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getPublicRestaurantes } from "../../services/api";
import Footer from "../../components/Footer";
import { authMediaUrl } from "../../services/mediaUrl";

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

    // El navegador intenta hacer scroll al ancla antes de que React termine de montar
    // el contenido, asi que lo repetimos manualmente una vez montada la pagina.
    useEffect(() => {
        if (window.location.hash) {
            const el = document.getElementById(window.location.hash.substring(1));
            el?.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    return (
        <div className="min-vh-100 d-flex flex-column landing-root">
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
                                <Link to="/register" className="btn rounded-pill px-4 hero-cta">
                                    Probar demo gratis →
                                </Link>
                                <a href="#como-funciona" className="btn rounded-pill px-4 hero-ghost">
                                    Ver cómo funciona
                                </a>
                            </div>
                            <div className="d-flex gap-5 mt-5 hero-stats">
                                <div>
                                    <div className="h3 fw-bold mb-0 hero-accent">2+</div>
                                    <small className="hero-stat-label">Restaurantes demo</small>
                                </div>
                                <div>
                                    <div className="h3 fw-bold mb-0 hero-accent">15+</div>
                                    <small className="hero-stat-label">Productos cargados</small>
                                </div>
                                <div>
                                    <div className="h3 fw-bold mb-0 hero-accent">4</div>
                                    <small className="hero-stat-label">Estados en vivo</small>
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
                                            <small className="hero-stat-label">Pedido #A47</small>
                                            <div className="fw-semibold" style={{ color: '#211a15' }}>Preparando · 4 ítems</div>
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
                <section id="funciones" className="section-block section-block--soft">
                    <div className="container py-5">
                    <div className="mb-4">
                        <span className="text-uppercase small fw-bold hero-accent">Funcionalidades</span>
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
                <section id="como-funciona" className="section-block section-block--white">
                    <div className="container py-5">
                    <div className="row g-4 align-items-center mb-4">
                        <div className="col-12 col-lg-7">
                            <span className="text-uppercase small fw-bold hero-accent">Flujo del cliente</span>
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
                <section id="restaurantes" className="py-5 section-block--soft" style={{ borderTop: '1px solid #ebe1d5' }}>
                    <div className="container">
                    <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
                        <div>
                            <h2 className="section-title hero-accent">Restaurantes destacados</h2>
                            <p className="hero-stat-label">Elige tu favorito y disfruta.</p>
                        </div>
                    </div>

                    {loadingRestaurantes ? (
                        <div className="text-center py-4">
                            <div className="spinner-border" style={{ color: '#e4531f' }} role="status"></div>
                        </div>
                    ) : restaurantes.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="hero-stat-label">No hay restaurantes disponibles</p>
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
                                                        src={authMediaUrl(rest.logo)}
                                                        alt={`Logo de ${rest.name}`}
                                                        className="rounded-circle"
                                                        style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid #f0d8c8' }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="d-inline-flex align-items-center justify-content-center" style={{ width: 80, height: 80, borderRadius: '50%', background: '#ffeee4', color: '#e4531f', fontSize: '2rem' }}>
                                                        <i className="fa-solid fa-store"></i>
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="h5 fw-bold mb-2" style={{ color: '#211a15' }}>{rest.name}</h3>
                                            <p className="hero-stat-label small mb-3">
                                                {rest.address || "Ubicación no especificada"}
                                            </p>
                                            <Link to={`/restaurante/${rest.id}/menu`} className="btn rounded-pill px-4 hero-cta">
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

            <Footer light />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

                .landing-root {
                    background: radial-gradient(900px 420px at 50% -120px, #fff2e6 0%, #faf5ee 62%, #f3ebdf 100%);
                    color: #211a15;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
                .hero-title {
                    font-family: 'Space Grotesk', sans-serif;
                    line-height: 1.05;
                    color: #211a15;
                }
                .hero-accent {
                    color: #e4531f;
                }
                .hero-subtitle {
                    color: #8c8178;
                    max-width: 540px;
                }
                .hero-stat-label {
                    color: #8c8178;
                }
                .hero-pill {
                    background: #ffeee4;
                    color: #c23d12;
                    border: 1px solid #f0d8c8;
                    font-weight: 700;
                }
                .hero-cta {
                    background: #e4531f;
                    color: #ffffff;
                    border: none;
                    font-weight: 700;
                }
                .hero-cta:hover {
                    background: #c23d12;
                    color: #ffffff;
                }
                .hero-ghost {
                    color: #211a15;
                    border: 1.5px solid #ebe1d5;
                    font-weight: 700;
                }
                .hero-ghost:hover {
                    border-color: #e4531f;
                    color: #e4531f;
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
                    box-shadow: 0 20px 40px -20px rgba(33,26,21,0.35);
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
                    background: #ffffff;
                    border: 1px solid #ebe1d5;
                    border-radius: 18px;
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    gap: 24px;
                    min-width: 260px;
                    box-shadow: 0 20px 40px -20px rgba(33,26,21,0.4);
                }
                .status-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #e4531f;
                    box-shadow: 0 0 12px rgba(228, 83, 31, 0.5);
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
                    background: #ebe1d5;
                }
                .status-bars .active {
                    background: #e4531f;
                }
                .section-title {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 2rem;
                    color: #211a15;
                }
                .section-subtitle {
                    color: #8c8178;
                }
                .section-block {
                    border-top: 1px solid #ebe1d5;
                }
                .section-block--soft {
                    background: #faf5ee;
                }
                .section-block--white {
                    background: #ffffff;
                }
                .feature-tile {
                    background: #ffffff;
                    border: 1px solid #ebe1d5;
                    border-radius: 18px;
                    padding: 22px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    box-shadow: 0 14px 30px -24px rgba(33,26,21,0.3);
                }
                .feature-tile h3 {
                    font-size: 1.05rem;
                    margin-bottom: 0;
                    color: #211a15;
                }
                .feature-tile p {
                    color: #8c8178;
                    font-size: 0.9rem;
                    margin-bottom: 0;
                }
                .feature-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    background: #ffeee4;
                    color: #e4531f;
                    display: grid;
                    place-items: center;
                    font-weight: 700;
                }
                .flow-card {
                    background: #ffffff;
                    border: 1px solid #ebe1d5;
                    border-radius: 20px;
                    padding: 24px;
                    min-height: 220px;
                    position: relative;
                    box-shadow: 0 14px 30px -24px rgba(33,26,21,0.3);
                }
                .flow-step {
                    position: relative;
                }
                .flow-number {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #e4531f;
                    margin-bottom: 12px;
                }
                .flow-card h4 {
                    font-size: 1.05rem;
                    margin-bottom: 10px;
                    color: #211a15;
                }
                .flow-card p {
                    color: #8c8178;
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
                        color: #e4531f;
                        font-size: 1.3rem;
                    }
                }
                .restaurant-card {
                    background: #ffffff;
                    border: 1px solid #ebe1d5;
                    border-radius: 18px;
                    box-shadow: 0 18px 38px -30px rgba(33,26,21,0.36);
                    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
                }
                .restaurant-card:hover {
                    transform: translateY(-3px);
                    border-color: #e4531f;
                    box-shadow: 0 22px 44px -30px rgba(228, 83, 31, 0.5);
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
