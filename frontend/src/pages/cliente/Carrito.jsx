import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../../components/DashboardNavbar";

export default function Carrito() {
    const { user, loading } = useAuth(['cliente']);
    const navigate = useNavigate();

    // 1. SOLUCIÓN AL ERROR: Cargamos el localStorage directamente en la inicialización
    const [carrito, setCarrito] = useState(() => {
        const storedCart = localStorage.getItem("carrito");
        return storedCart ? JSON.parse(storedCart) : [];
    });

    const handleRemoveFromCart = (productId) => {
        const updatedCart = carrito.filter(item => item.id !== productId);
        setCarrito(updatedCart);
        localStorage.setItem("carrito", JSON.stringify(updatedCart));
    };

    const handleUpdateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveFromCart(productId);
            return;
        }
        const updatedCart = carrito.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        );
        setCarrito(updatedCart);
        localStorage.setItem("carrito", JSON.stringify(updatedCart));
    };

    const getTotal = () => {
        return carrito.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    };

    const handleCheckout = () => {
        alert("🚀 Función de pago en desarrollo. Próximamente disponible.");
    };

    // 2. ELIMINADO: Ya no necesitas el useEffect para cargar el carrito al montar
    // useEffect(() => { ... }, []);

    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <DashboardNavbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                    <div className="spinner-border text-light me-3" role="status"></div>
                    <span>Cargando tu carrito...</span>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <DashboardNavbar />
            
            <div className="container py-5 flex-grow-1">
                <div className="text-white mb-4 animate__animated animate__fadeIn">
                    <h1 className="fw-bold">Mi Carrito</h1>
                    <p className="opacity-75">Gestiona tus productos antes de finalizar el pedido</p>
                </div>

                {carrito.length === 0 ? (
                    <div className="card border-white border-opacity-25 text-white text-center p-5 animate__animated animate__zoomIn"
                         style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(15px)', borderRadius: '20px' }}>
                        <div className="display-1 mb-3">🛍️</div>
                        <h3>Tu carrito está vacío</h3>
                        <p className="text-white-50">¡Parece que aún no has elegido nada delicioso!</p>
                        <button onClick={() => navigate("/menu")} className="btn btn-light mt-3 fw-bold rounded-pill px-4">
                            Ir al Menú
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {/* Tabla de Productos */}
                        <div className="col-lg-8">
                            <div className="card border-white border-opacity-25 text-white overflow-hidden shadow-lg"
                                 style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(15px)', borderRadius: '20px' }}>
                                <div className="table-responsive">
                                    <table className="table table-dark table-hover mb-0 align-middle shadow-none" style={{ background: 'transparent' }}>
                                        <thead className="bg-white bg-opacity-10">
                                            <tr>
                                                <th className="px-4 py-3 border-0 small text-uppercase opacity-50">Producto</th>
                                                <th className="py-3 border-0 small text-uppercase opacity-50">Precio</th>
                                                <th className="py-3 border-0 small text-uppercase opacity-50 text-center">Cantidad</th>
                                                <th className="py-3 border-0 small text-uppercase opacity-50">Subtotal</th>
                                                <th className="px-4 py-3 border-0 text-end"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="border-top-0">
                                            {carrito.map(item => (
                                                <tr key={item.id} className="border-bottom border-white border-opacity-10">
                                                    <td className="px-4 py-3 fw-semibold">{item.name}</td>
                                                    <td className="py-3">${Number(item.price).toFixed(2)}</td>
                                                    <td className="py-3 text-center">
                                                        <div className="btn-group btn-group-sm bg-dark bg-opacity-25 rounded-pill p-1">
                                                            <button 
                                                                className="btn btn-sm btn-link text-white text-decoration-none px-2"
                                                                onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                                                            >-</button>
                                                            <span className="px-2 align-self-center small fw-bold">{item.quantity || 1}</span>
                                                            <button 
                                                                className="btn btn-sm btn-link text-white text-decoration-none px-2"
                                                                onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                                                            >+</button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 fw-bold">${(item.price * (item.quantity || 1)).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-end">
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                                                            onClick={() => handleRemoveFromCart(item.id)}
                                                        >✕</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Resumen del Pago */}
                        <div className="col-lg-4">
                            <div className="card border-white border-opacity-25 text-white shadow-lg"
                                 style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(15px)', borderRadius: '20px' }}>
                                <div className="card-body p-4">
                                    <h4 className="fw-bold mb-4">Resumen</h4>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="opacity-75">Subtotal</span>
                                        <span>${getTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="opacity-75">Envío</span>
                                        <span className="text-success fw-bold">Gratis</span>
                                    </div>
                                    <hr className="border-white border-opacity-25" />
                                    <div className="d-flex justify-content-between mb-4 mt-2">
                                        <span className="h5 fw-bold">Total</span>
                                        <span className="h5 fw-bold text-info">${getTotal().toFixed(2)}</span>
                                    </div>
                                    <button 
                                        onClick={handleCheckout}
                                        className="btn btn-primary w-100 fw-bold py-3 shadow-sm"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                                            border: 'none',
                                            borderRadius: '12px'
                                        }}
                                    >
                                        Proceder al Pago
                                    </button>
                                    <button 
                                        onClick={() => navigate("/menu")}
                                        className="btn btn-outline-light w-100 mt-3 border-0 small opacity-75"
                                    >
                                        ← Continuar Comprando
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}