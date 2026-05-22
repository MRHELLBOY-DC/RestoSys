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
        <div className="min-vh-100 d-flex flex-column text-white" 
             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            
            <Navbar />

            <main className="flex-grow-1 container d-flex flex-column justify-content-center py-5">
                {/* Hero Section */}
                <div className="text-center mb-5 animate__animated animate__fadeInDown">
                    <h1 className="display-1 fw-bolder mb-3 text-transparent bg-clip-text" 
                        style={{ backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Menu Digital
                    </h1>
                </div>

                {/* ========== SECCIÓN: RESTAURANTES ========== */}
                <div className="mb-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">Restaurantes Destacados</h2>
                        <p className="text-white-50">Elige tu favorito y disfruta</p>
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
                                    <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 transition-hover" 
                                         style={{ backdropFilter: 'blur(10px)', borderRadius: '15px', overflow: 'hidden' }}>
                                        <div className="card-body text-center p-4">
                                            {/* LOGO DEL RESTAURANTE */}
                                            <div className="mb-3">
                                                {rest.logo ? (
                                                    <img 
                                                        src={`http://localhost:8000${rest.logo}`} 
                                                        alt={`Logo de ${rest.name}`}
                                                        className="rounded-circle"
                                                        style={{ 
                                                            width: '80px', 
                                                            height: '80px', 
                                                            objectFit: 'cover',
                                                            border: '2px solid rgba(255,255,255,0.3)'
                                                        }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = '<span style="font-size: 3rem">🏪</span>';
                                                        }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '3rem' }}></span>
                                                )}
                                            </div>
                                            <h3 className="h5 fw-bold mb-2">{rest.name}</h3>
                                            <p className="text-white-50 small mb-3">
                                                {rest.address || "Ubicación no especificada"}
                                            </p>
                                            <Link 
                                                to={`/restaurante/${rest.id}/menu`} 
                                                className="btn btn-outline-light rounded-pill px-4"
                                                style={{ fontSize: '0.85rem' }}
                                            >
                                                Ver Menú →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Features Grid (original, sin cambios) */}
                <div className="row g-4 justify-content-center">
                    {/* Feature 1 */}
                    <div className="col-12 col-md-4">
                        <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 text-center p-4 shadow-sm transition-hover" style={{ backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                            <img src="/menu.jfif" alt="Menú Digital" className="img-fluid mx-auto mb-3" style={{ maxWidth: '100px' }} />
                            <h3 className="h4">Menú Digital</h3>
                            <p className="text-white-50 small">Explora el menú de tus restaurantes favoritos desde tu celular</p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="col-12 col-md-4">
                        <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 text-center p-4 shadow-sm transition-hover" style={{ backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                            <img src="/QR.png" alt="QR Code" className="img-fluid mx-auto mb-3" style={{ maxWidth: '100px' }} />
                            <h3 className="h4">Escanea QR</h3>
                            <p className="text-white-50 small">Solo escanea el código QR en la mesa y haz tu pedido</p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="col-12 col-md-4">
                        <div className="card h-100 bg-white bg-opacity-10 border-white border-opacity-25 text-center p-4 shadow-sm transition-hover" style={{ backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                            <img src="/pedidos.jpg" alt="Pedidos Rápidos" className="img-fluid mx-auto mb-3" style={{ maxWidth: '100px' }} />
                            <h3 className="h4">Pedidos Rápidos</h3>
                            <p className="text-white-50 small">Realiza tus pedidos en segundos y sin complicaciones</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-black bg-opacity-25 py-4 mt-auto">
                <div className="container text-center">
                    <p className="text-white-50 mb-1 small">© 2026 Menu Digital - Todos los derechos reservados</p>
                    <div className="small text-white-50">
                        <span>Luis Alfredo Vargas Pizarro</span> | <span>Eduardo Durana</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}