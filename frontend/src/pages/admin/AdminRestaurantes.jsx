import { useEffect, useState } from "react";
import { getCurrentUser, getAdminRestaurantes, createRestaurante, updateRestaurante, deleteRestaurante } from "../../services/api";  // ✅ Importa desde api, no desde menuApi
import { useNavigate } from "react-router-dom";

export default function AdminRestaurantes() {
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        name: "",
        address: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = getCurrentUser();
        
        if (!token || user?.role !== 'admin') {
            navigate("/login");
            return;
        }
        
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getAdminRestaurantes();  // ✅ Esta función usa AUTH_API (puerto 8000)
            setRestaurantes(data);
        } catch (error) {
            console.error("Error loading restaurantes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.name.trim()) {
            alert("El nombre es requerido");
            return;
        }
        
        try {
            if (editing) {
                await updateRestaurante(editing, {
                    name: form.name,
                    address: form.address
                });
                alert("Restaurante actualizado");
            } else {
                await createRestaurante({
                    name: form.name,
                    address: form.address
                });
                alert("Restaurante creado");
            }
            
            setForm({ name: "", address: "" });
            setEditing(null);
            loadData();
        } catch (error) {
            console.error("Error:", error);
            alert("Error al guardar");
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`¿Eliminar el restaurante "${name}"?`)) {
            try {
                await deleteRestaurante(id);
                alert("Restaurante eliminado");
                loadData();
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
                                    <td>{r.address || "Sin dirección"}</td>
                                    <td>
                                        <button onClick={() => {
                                            setEditing(r.id);
                                            setForm({
                                                name: r.name,
                                                address: r.address || ""
                                            });
                                        }}>Editar</button>
                                        <button onClick={() => handleDelete(r.id, r.name)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}