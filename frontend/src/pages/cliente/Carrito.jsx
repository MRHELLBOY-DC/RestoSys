import { useEffect, useState } from "react";
import { getCurrentUser } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function Carrito() {
    const [user, setUser] = useState(null);
    const [carrito, setCarrito] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const currentUser = getCurrentUser();

        if (!token || currentUser?.role !== 'cliente') {
            navigate("/login");
            return;
        }

        // Cargar usuario y carrito
        setUser(currentUser);
        
        // Cargar carrito del localStorage
        const storedCart = localStorage.getItem("carrito");
        if (storedCart) {
            setCarrito(JSON.parse(storedCart));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRemoveFromCart = (productId) => {
        const updatedCart = carrito.filter(item => item.id !== productId);
        setCarrito(updatedCart);
        localStorage.setItem("carrito", JSON.stringify(updatedCart));
    };

    const getTotal = () => {
        return carrito.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    };

    if (!user) return <p>Cargando...</p>;

    return (
        <div className="carrito">
            <button onClick={() => navigate("/cliente/dashboard")} className="back-btn">
                ← Volver al Dashboard
            </button>
            
            <h1>Mi Carrito</h1>
            
            {carrito.length === 0 ? (
                <p>Tu carrito está vacío</p>
            ) : (
                <>
                    <table className="table">
                        <thead>
                            <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {carrito.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>${item.price}</td>
                                    <td>{item.quantity || 1}</td>
                                    <td>${(item.price * (item.quantity || 1)).toFixed(2)}</td>
                                    <td>
                                        <button onClick={() => handleRemoveFromCart(item.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h3>Total: ${getTotal().toFixed(2)}</h3>
                    <button className="checkout-btn">Proceder al Pago</button>
                </>
            )}
            
            <style>{`
                .carrito { padding: 20px; max-width: 1000px; margin: 0 auto; }
                .back-btn { margin-bottom: 20px; padding: 10px; background: #6c757d; color: white; border: none; cursor: pointer; border-radius: 5px; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                .table th { background: #f2f2f2; }
                .table button { background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
                .checkout-btn { margin-top: 20px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
                .checkout-btn:hover { background: #218838; }
            `}</style>
        </div>
    );
}