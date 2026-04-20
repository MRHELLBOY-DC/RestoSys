import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../services/api"; // eslint-disable-line no-unused-vars
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8001";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export default function AdminRestaurantes() {
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", address: "" });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = getCurrentUser();
        
        if (!token || user?.role !== 'admin') {
            navigate("/login");
            return;
        }
        
        loadRestaurantes();
    }, [navigate]);

    const loadRestaurantes = async () => {
        try {
            const res = await fetch(`${API}/api/admin/restaurantes/`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            setRestaurantes(data);
        } catch (error) {
            console.error("Error loading restaurantes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const url = editing 
            ? `${API}/api/admin/restaurantes/${editing}/`
            : `${API}/api/admin/restaurantes/`;
        
        const method = editing ? "PUT" : "POST";
        
        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(form)
            });
            
            if (res.ok) {
                alert(editing ? "Restaurante actualizado" : "Restaurante creado");
                setForm({ name: "", address: "" });
                setEditing(null);
                loadRestaurantes();
            } else {
                const error = await res.json();
                alert("Error: " + JSON.stringify(error));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al guardar");
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`¿Eliminar el restaurante "${name}"?`)) {
            try {
                const res = await fetch(`${API}/api/admin/restaurantes/${id}/`, {
                    method: "DELETE",
                    headers: getAuthHeaders()
                });
                
                if (res.ok) {
                    alert("Restaurante eliminado");
                    loadRestaurantes();
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Error al eliminar");
            }
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="admin-restaurantes">
            <button onClick={() => navigate("/admin/dashboard")} className="back-btn">
                ← Volver al Dashboard
            </button>
            
            <h1>Gestión de Restaurantes</h1>
            
            <form onSubmit={handleSubmit} className="form">
                <h2>{editing ? "Editar" : "Nuevo"} Restaurante</h2>
                <input
                    type="text"
                    placeholder="Nombre del restaurante"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required
                />
                <input
                    type="text"
                    placeholder="Dirección"
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                    required
                />
                <button type="submit">{editing ? "Actualizar" : "Crear"}</button>
                {editing && (
                    <button type="button" onClick={() => {
                        setEditing(null);
                        setForm({ name: "", address: "" });
                    }}>
                        Cancelar
                    </button>
                )}
            </form>
            
            <div className="restaurantes-list">
                <h2>Restaurantes existentes</h2>
                {restaurantes.length === 0 ? (
                    <p>No hay restaurantes. Crea el primero!</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr><th>ID</th><th>Nombre</th><th>Dirección</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {restaurantes.map(r => (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td>{r.name}</td>
                                    <td>{r.address}</td>
                                    <td>
                                        <button onClick={() => {
                                            setEditing(r.id);
                                            setForm({ name: r.name, address: r.address });
                                        }}>Editar</button>
                                        <button onClick={() => handleDelete(r.id, r.name)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <style>{`
                .admin-restaurantes { padding: 20px; max-width: 1000px; margin: 0 auto; }
                .back-btn { margin-bottom: 20px; padding: 10px; background: #6c757d; color: white; border: none; cursor: pointer; }
                .form { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 5px; }
                .form input { margin: 5px; padding: 8px; width: 200px; }
                .form button { margin: 5px; padding: 8px 15px; cursor: pointer; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                .table button { margin: 0 5px; padding: 5px 10px; cursor: pointer; }
            `}</style>
        </div>
    );
}