import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { 
    getAdminUsuarios, 
    getAdminRestaurantes, 
    createAdminUsuario, 
    updateAdminUsuario, 
    deleteAdminUsuario, 
    asignarRestaurante,
    getCurrentUser
} from "../../../services/api";
import AdminShell from "../../../components/AdminShell";

export default function AdminRestauranteUsuarios() {
    const { loading: authLoading } = useAuth(['restaurante']);
    const [usuarios, setUsuarios] = useState([]);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        role: "cliente",
        restaurante_id: ""
    });

    // Obtener usuario autenticado
    const currentUser = getCurrentUser();
    const isAdminRestaurante = currentUser?.role === 'restaurante';

    const sanitizeUsername = (value) => {
        if (!value) return "";
        const trimmed = value.trim().toLowerCase();
        const safe = trimmed
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9@.+_-]/g, "");
        return safe || "user";
    };

    const usernameFromName = (name, email) => {
        const base = sanitizeUsername(name);
        if (base && base !== "user") return base;
        return sanitizeUsername(email);
    };

    useEffect(() => {
        if (!authLoading) {
            loadData();
        }
    }, [authLoading]);

    const loadData = async () => {
        try {
            let usuariosData = [];
            let restaurantesData = [];

            // Admin Restaurante: carga todos los usuarios y filtra localmente
            usuariosData = await getAdminUsuarios();
            
            // Usar el restaurante del usuario autenticado para el select
            if (currentUser.restaurant_id) {
                restaurantesData = [{
                    id: currentUser.restaurant_id,
                    name: currentUser.restaurant?.name || "Tu restaurante"
                }];
            }

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
            // Forzar el restaurante_id del admin
            const restauranteId = currentUser.restaurant_id;
            
            if (editing) {
                const updateData = {
                    username: usernameFromName(form.full_name, form.email),
                    full_name: form.full_name,
                    email: form.email,
                    role: form.role
                };
                if (form.role !== 'cliente' && restauranteId) {
                    updateData.restaurante_id = restauranteId;
                }
                await updateAdminUsuario(editing, updateData);
            } else {
                const createData = {
                    username: usernameFromName(form.full_name, form.email),
                    full_name: form.full_name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                };
                if (form.role !== 'cliente' && restauranteId) {
                    createData.restaurante_id = restauranteId;
                }
                await createAdminUsuario(createData);
            }
            setForm({ full_name: "", email: "", password: "", role: "cliente", restaurante_id: "" });
            setEditing(null);
            loadData();
        } catch (error) {
            console.log("=== ERROR COMPLETO ===");
            console.log("error:", error);
            
            const errorData = error?.data || error?.response?.data || error;
            
            const message = errorData?.error
                || (errorData?.email ? (Array.isArray(errorData.email) ? errorData.email[0] : errorData.email) : null)
                || (errorData?.username ? (Array.isArray(errorData.username) ? errorData.username[0] : errorData.username) : null)
                || errorData?.message
                || errorData?.detail
                || "Error al guardar";
            
            alert("Error al guardar: " + message);
        }
    };

    const handleDelete = async (id, username) => {
        if (window.confirm(`¿Eliminar el usuario "${username}"?`)) {
            try {
                await deleteAdminUsuario(id);
                loadData();
            } catch (error) {
                console.error("Error al eliminar:", error);
                const errorData = error?.data || error?.response?.data || error;
                const message = errorData?.error || errorData?.message || "Error al eliminar";
                alert("Error al eliminar: " + message);
            }
        }
    };

    const handleAsignarRestaurante = async (usuarioId, restauranteId) => {
        if (!restauranteId) return;
        try {
            await asignarRestaurante(usuarioId, restauranteId);
            loadData();
        } catch (error) {
            console.error("Error al asignar:", error);
            alert("Error al asignar");
        }
    };

    const getBadgeColor = (rol) => {
        switch (rol) {
            case 'admin': return 'bg-danger';
            case 'restaurante': return 'bg-warning text-dark';
            case 'empleado': return 'bg-success';
            default: return 'bg-info text-dark';
        }
    };

    // FILTRO - Solo muestra usuarios de su restaurante
    const filteredUsuarios = usuarios.filter(u => {
        // Si es el propio Admin Restaurante, siempre mostrar
        if (u.id === currentUser.id) {
            return true;
        }
        
        // Si tiene restaurant_id, verificar que coincida
        if (u.restaurant_id) {
            return u.restaurant_id === currentUser.restaurant_id;
        }
        
        // Si tiene restaurant anidado, verificar que coincida
        if (u.restaurant?.id) {
            return u.restaurant.id === currentUser.restaurant_id;
        }
        
        // Si es empleado o cliente, mostrarlo (asumimos que es de su restaurante)
        if (u.role === 'empleado' || u.role === 'cliente') {
            return true;
        }
        
        return false;
    });

    if (loading) return (
        <div className="admin-loading">
            <div className="d-flex align-items-center gap-2">
                <div className="spinner-border" role="status"></div>
                <span>Sincronizando usuarios...</span>
            </div>
        </div>
    );

    return (
        <AdminShell
            title="Usuarios"
            subtitle="Control de roles y cuentas de tu restaurante."
            actions={(
                <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() => {
                        setEditing(null);
                        setForm({ 
                            full_name: "", 
                            email: "", 
                            password: "", 
                            role: "cliente", 
                            restaurante_id: currentUser.restaurant_id
                        });
                    }}
                >
                    + Invitar usuario
                </button>
            )}
        >
            <div className="admin-grid admin-grid-2">
                <div className="admin-card admin-card--glass">
                    <h3 className="h5 fw-bold mb-4">{editing ? "Editar" : "Nuevo"} Usuario</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label small fw-semibold text-white-50">Nombre completo</label>
                            <input
                                type="text"
                                className="form-control admin-input"
                                value={form.full_name}
                                onChange={e => setForm({...form, full_name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-semibold text-white-50">Email</label>
                            <input
                                type="email"
                                className="form-control admin-input"
                                value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                                required
                            />
                        </div>

                        {!editing && (
                            <div className="mb-3">
                                <label className="form-label small fw-semibold text-white-50">Contrasena</label>
                                <input
                                    type="password"
                                    className="form-control admin-input"
                                    value={form.password}
                                    onChange={e => setForm({...form, password: e.target.value})}
                                    required
                                />
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label small fw-semibold text-white-50">Rol de acceso</label>
                            <select
                                className="form-select admin-select"
                                value={form.role}
                                onChange={e => setForm({...form, role: e.target.value, restaurante_id: e.target.value === 'cliente' ? "" : form.restaurante_id})}
                            >
                                <option value="cliente" className="bg-dark text-white">Cliente</option>
                                <option value="empleado" className="bg-dark text-white">Empleado</option>
                            </select>
                        </div>

                        {form.role !== 'cliente' && (
                            <div className="mb-4">
                                <label className="form-label small fw-semibold text-white-50">Asignar sede</label>
                                <select
                                    className="form-select admin-select"
                                    value={form.restaurante_id}
                                    onChange={e => setForm({...form, restaurante_id: e.target.value})}
                                >
                                    <option value={currentUser.restaurant_id} className="bg-dark text-white">
                                        {currentUser.restaurant?.name || "Tu restaurante"}
                                    </option>
                                </select>
                            </div>
                        )}

                        <div className="d-grid gap-2 mt-4">
                            <button type="submit" className="admin-btn admin-btn-primary">
                                {editing ? "Guardar cambios" : "Registrar usuario"}
                            </button>
                            {editing && (
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-ghost"
                                    onClick={() => {
                                        setEditing(null);
                                        setForm({ full_name: "", email: "", password: "", role: "cliente", restaurante_id: "" });
                                    }}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="admin-card admin-card--glass">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h3 className="h5 fw-bold mb-1">Usuarios registrados</h3>
                            <small className="admin-subtitle">{filteredUsuarios.length} cuentas activas</small>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Rol</th>
                                    <th>Sede asignada</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsuarios.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="admin-user-avatar">
                                                    {(u.full_name || u.username || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <span className="fw-semibold">{u.full_name || u.username}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill ${getBadgeColor(u.role)}`}>
                                                {u.role === 'admin' ? 'Super Admin' : 
                                                 u.role === 'restaurante' ? 'Admin Restaurante' : 
                                                 u.role === 'empleado' ? 'Empleado' : 'Cliente'}
                                            </span>
                                        </td>
                                        <td>
                                            {u.role === 'cliente' ? (
                                                <small className="text-white-50">Acceso QR</small>
                                            ) : u.restaurant?.name ? (
                                                <span className="small text-white-50">{u.restaurant.name}</span>
                                            ) : u.restaurant_id ? (
                                                <span className="small text-white-50">Restaurante ID: {u.restaurant_id}</span>
                                            ) : (
                                                <select
                                                    className="form-select form-select-sm admin-select"
                                                    onChange={(e) => handleAsignarRestaurante(u.id, e.target.value)}
                                                    defaultValue=""
                                                    style={{ maxWidth: '170px' }}
                                                >
                                                    <option value="" className="bg-dark">Asignar...</option>
                                                    {restaurantes.map(r => (
                                                        <option key={r.id} value={r.id} className="bg-dark text-white">{r.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button className="admin-btn admin-btn-ghost" onClick={() => {
                                                    setEditing(u.id);
                                                    setForm({
                                                        full_name: u.full_name || "",
                                                        email: u.email || "",
                                                        password: "",
                                                        role: u.role,
                                                        restaurante_id: u.restaurant?.id || u.restaurant_id || ""
                                                    });
                                                }}>Editar</button>
                                                {/* Admin Restaurante puede eliminar usuarios (excepto Super Admin) */}
                                                {u.role !== 'admin' && (
                                                    <button className="admin-btn admin-btn-primary" onClick={() => handleDelete(u.id, u.username)}>Eliminar</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}