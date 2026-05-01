import { useEffect, useState } from "react";
import { getCurrentUser } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function MisPedidos() {
    const [user, setUser] = useState(null);
    const [pedidos, setPedidos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const currentUser = getCurrentUser();

        if (!token || currentUser?.role !== 'cliente') {
            navigate("/login");
            return;
        }

        setUser(currentUser);
        
        // TODO: Conectar con el API de pedidos
        // Por ahora, datos de ejemplo
        setPedidos([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!user) return <p>Cargando...</p>;

    return (
        <div className="mis-pedidos">
            <button onClick={() => navigate("/cliente/dashboard")} className="back-btn">
                ← Volver al Dashboard
            </button>
            
            <h1>Mis Pedidos</h1>
            
            {pedidos.length === 0 ? (
                <p>No tienes pedidos realizados</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr><th>ID</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        {pedidos.map(pedido => (
                            <tr key={pedido.id}>
                                <td>{pedido.id}</td>
                                <td>{pedido.fecha}</td>
                                <td>${pedido.total}</td>
                                <td>{pedido.estado}</td>
                                <td><button>Ver Detalle</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            <style>{`
                .mis-pedidos { padding: 20px; max-width: 1000px; margin: 0 auto; }
                .back-btn { margin-bottom: 20px; padding: 10px; background: #6c757d; color: white; border: none; cursor: pointer; border-radius: 5px; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                .table th { background: #f2f2f2; }
                .table button { background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
                .table button:hover { background: #0056b3; }
            `}</style>
        </div>
    );
}