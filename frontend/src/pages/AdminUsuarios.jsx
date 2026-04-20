import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/api";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8001";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        username: "",
        password: "",
        role: "cliente",
        restaurante_id: ""
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
    }, [navigate]);

    const loadData = async () => {
        try {
            const [usuariosRes, restaurantesRes] = await Promise.all([
                fetch(`${API}/api/admin/usuarios/`, { headers: getAuthHeaders() }),
                fetch(`${API}/api/admin/restaurantes/`, { headers: getAuthHeaders() })
            ]);
            
            const usuariosData = await usuariosRes.json();
            const restaurantesData = await restaurantesRes.json();
            
            setUsuarios(usuariosData);
            setRestaurantes(restaurantesData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const url = editing 
            ? `${API}/api/admin/usuarios/${editing}/`
            : `${API}/api/admin/usuarios/`;
        
        const method = editing ? "PUT" : "POST";
        
        const dataToSend = editing 
            ? { username: form.username, role: form.role, restaurante_id: form.restaurante_id }
            : { username: form.username, password: form.password, role: form.role, restaurante_id: form.restaurante_id };
        
        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(dataToSend)
            });
            
            if (res.ok) {
                alert(editing ? "Usuario actualizado" : "Usuario creado");
                setForm({ username: "", password: "", role: "cliente", restaurante_id: "" });
                setEditing(null);
                loadData();
            } else {
                const error = await res.json();
                alert("Error: " + JSON.stringify(error));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al guardar");
        }
    };

    const handleDelete = async (id, username) => {
        if (window.confirm(`¿Eliminar el usuario "${username}"?`)) {
            try {
                const res = await fetch(`${API}/api/admin/usuarios/${id}/`, {
                    method: "DELETE",
                    headers: getAuthHeaders()
                });
                
                if (res.ok) {
                    alert("Usuario eliminado");
                    loadData();
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Error al eliminar");
            }
        }
    };

    const handleAsignarRestaurante = async (usuarioId, restauranteId) => {
        try {
            const res = await fetch(`${API}/api/admin/usuarios/${usuarioId}/asignar-restaurante/`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ restaurante_id: restauranteId })
            });
            
            if (res.ok) {
                alert("Restaurante asignado correctamente");
                loadData();
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al asignar");
        }
    };

    const getRolNombre = (rol) => {
        const roles = {
            'admin': 'Administrador',
            'restaurante': 'Restaurante',
            'cliente': 'Cliente'
        };
        return roles[rol] || rol;
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="admin-usuarios">
            <button onClick={() => navigate("/admin/dashboard")} className="back-btn">
                ← Volver al Dashboard
            </button>
            
            <h1>Gestión de Usuarios</h1>
            
            <form onSubmit={handleSubmit} className="form">
                <h2>{editing ? "Editar" : "Nuevo"} Usuario</h2>
                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={form.username}
                    onChange={e => setForm({...form, username: e.target.value})}
                    required
                />
                {!editing && (
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                        required
                    />
                )}
                <select
                    value={form.role}
                    onChange={e => setForm({...form, role: e.target.value})}
                >
                    <option value="cliente">Cliente</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="admin">Administrador</option>
                </select>
                <select
                    value={form.restaurante_id}
                    onChange={e => setForm({...form, restaurante_id: e.target.value})}
                >
                    <option value="">Sin restaurante</option>
                    {restaurantes.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
                <button type="submit">{editing ? "Actualizar" : "Crear"}</button>
                {editing && (
                    <button type="button" onClick={() => {
                        setEditing(null);
                        setForm({ username: "", password: "", role: "cliente", restaurante_id: "" });
                    }}>
                        Cancelar
                    </button>
                )}
            </form>
            
            <div className="usuarios-list">
                <h2>Usuarios existentes</h2>
                {usuarios.length === 0 ? (
                    <p>No hay usuarios. Crea el primero!</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr><th>ID</th><th>Usuario</th><th>Rol</th><th>Restaurante</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.username}</td>
                                    <td>{getRolNombre(u.role)}</td>
                                    <td>
                                        {u.restaurant?.name || "Sin asignar"}
                                        {u.role === 'restaurante' && !u.restaurant && (
                                            <select onChange={(e) => handleAsignarRestaurante(u.id, e.target.value)}>
                                                <option value="">Asignar restaurante</option>
                                                {restaurantes.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td>
                                        <button onClick={() => {
                                            setEditing(u.id);
                                            setForm({
                                                username: u.username,
                                                role: u.role,
                                                restaurante_id: u.restaurant?.id || ""
                                            });
                                        }}>Editar</button>
                                        <button onClick={() => handleDelete(u.id, u.username)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <style>{`
                .admin-usuarios { padding: 20px; max-width: 1200px; margin: 0 auto; }
                .back-btn { margin-bottom: 20px; padding: 10px; background: #6c757d; color: white; border: none; cursor: pointer; }
                .form { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 5px; }
                .form input, .form select { margin: 5px; padding: 8px; width: 200px; }
                .form button { margin: 5px; padding: 8px 15px; cursor: pointer; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                .table button { margin: 0 5px; padding: 5px 10px; cursor: pointer; }
                .table select { padding: 5px; }
            `}</style>
        </div>
    );
}