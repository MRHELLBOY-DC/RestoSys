import { useEffect, useState } from "react";
import { 
        getCurrentUser, 
        getAdminUsuarios, 
        getAdminRestaurantes, 
        createAdminUsuario, 
        updateAdminUsuario, 
        deleteAdminUsuario, 
        asignarRestaurante 
    } from "../../services/api";
import { useNavigate } from "react-router-dom";

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
            const [usuariosData, restaurantesData] = await Promise.all([
                getAdminUsuarios(),
                getAdminRestaurantes()
            ]);
            
            setUsuarios(usuariosData);
            setRestaurantes(restaurantesData);
        } catch (error) {
            console.error("Error loading data:", error);
            alert("Error al cargar datos: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // ✅ Para clientes, NUNCA enviar restaurante_id
            const isCliente = form.role === 'cliente';
            
            if (editing) {
                const updateData = {
                    username: form.username,
                    role: form.role,
                };
                // Solo enviar restaurante_id si NO es cliente
                if (!isCliente) {
                    updateData.restaurante_id = form.restaurante_id;
                }
                await updateAdminUsuario(editing, updateData);
                alert("Usuario actualizado");
            } else {
                const createData = {
                    username: form.username,
                    password: form.password,
                    role: form.role,
                };
                // Solo enviar restaurante_id si NO es cliente
                if (!isCliente) {
                    createData.restaurante_id = form.restaurante_id;
                }
                await createAdminUsuario(createData);
                alert("Usuario creado");
            }
            
            setForm({ username: "", password: "", role: "cliente", restaurante_id: "" });
            setEditing(null);
            loadData();
        } catch (error) {
            console.error("Error:", error);
            alert("Error al guardar: " + error.message);
        }
    };

    const handleDelete = async (id, username) => {
        if (window.confirm(`¿Eliminar el usuario "${username}"?`)) {
            try {
                await deleteAdminUsuario(id);
                alert("Usuario eliminado");
                loadData();
            } catch (error) {
                console.error("Error:", error);
                alert("Error al eliminar");
            }
        }
    };

    const handleAsignarRestaurante = async (usuarioId, restauranteId) => {
        if (!restauranteId) return;
        
        try {
            await asignarRestaurante(usuarioId, restauranteId);
            alert("Restaurante asignado correctamente");
            loadData();
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
                    onChange={e => {
                        const newRole = e.target.value;
                        // Al cambiar el rol, limpiar restaurante_id si es cliente
                        setForm({
                            ...form,
                            role: newRole,
                            restaurante_id: newRole === 'cliente' ? "" : form.restaurante_id
                        });
                    }}
                >
                    <option value="cliente">Cliente</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="admin">Administrador</option>
                </select>
                
                {/* ⚠️ Campo de restaurante SOLO para roles que no son cliente */}
                {form.role !== 'cliente' && (
                    <select
                        value={form.restaurante_id}
                        onChange={e => setForm({...form, restaurante_id: e.target.value})}
                    >
                        <option value="">Sin restaurante</option>
                        {restaurantes.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                )}
                
                {/* ℹ️ Mensaje informativo para clientes */}
                {form.role === 'cliente' && (
                    <small style={{ display: 'block', margin: '5px 0', color: '#666', fontStyle: 'italic' }}>
                        ℹ️ Los clientes NO requieren restaurante asignado. Verán el menú escaneando un QR.
                    </small>
                )}
                
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
                                        {u.role === 'cliente' ? (
                                            <span style={{ color: '#999', fontStyle: 'italic' }}>—</span>
                                        ) : (
                                            u.restaurant?.name || "Sin asignar"
                                        )}
                                        {u.role === 'restaurante' && !u.restaurant && restaurantes.length > 0 && (
                                            <select 
                                                onChange={(e) => handleAsignarRestaurante(u.id, e.target.value)}
                                                defaultValue=""
                                            >
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
                                                password: "",
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
                .back-btn { margin-bottom: 20px; padding: 10px; background: #6c757d; color: white; border: none; cursor: pointer; border-radius: 5px; }
                .back-btn:hover { background: #5a6268; }
                .form { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 5px; }
                .form input, .form select { margin: 5px; padding: 8px; width: 250px; border-radius: 4px; border: 1px solid #ccc; display: block; }
                .form button { margin: 5px; padding: 8px 15px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px; }
                .form button:hover { background: #0056b3; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                .table th { background: #f2f2f2; }
                .table button { margin: 0 5px; padding: 5px 10px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 4px; }
                .table button:first-child { background: #28a745; }
                .table button:first-child:hover { background: #218838; }
                .table button:hover { background: #c82333; }
                .table select { padding: 5px; border-radius: 4px; }
            `}</style>
        </div>
    );
}