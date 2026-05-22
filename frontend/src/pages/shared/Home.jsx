import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function Home() {
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

                {/* Features Grid */}
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