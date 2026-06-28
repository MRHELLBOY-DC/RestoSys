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
import UsuarioModal from "../../../components/modals/UsuarioModal"; // Importar el modal

export default function AdminRestauranteUsuarios() {
    const { loading: authLoading } = useAuth(['restaurante']);
    const [usuarios, setUsuarios] = useState([]);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
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

    // Abrir modal para crear
    const handleOpenCreateModal = () => {
        setEditing(null);
        setForm({ 
            full_name: "", 
            email: "", 
            password: "", 
            role: "cliente", 
            restaurante_id: currentUser.restaurant_id || ""
        });
        setModalOpen(true);
    };

    // Abrir modal para editar
    const handleOpenEditModal = (usuario) => {
        setEditing(usuario.id);
        setForm({
            full_name: usuario.full_name || "",
            email: usuario.email || "",
            password: "",
            role: usuario.role,
            restaurante_id: usuario.restaurant?.id || usuario.restaurant_id || currentUser.restaurant_id || ""
        });
        setModalOpen(true);
    };

    // Cerrar modal
    const handleCloseModal = () => {
        setModalOpen(false);
        setEditing(null);
        setForm({ 
            full_name: "", 
            email: "", 
            password: "", 
            role: "cliente", 
            restaurante_id: ""
        });
        setSubmitting(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
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
            handleCloseModal();
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
        } finally {
            setSubmitting(false);
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
        <>
            <AdminShell
                title="Usuarios"
                subtitle="Control de roles y cuentas de tu restaurante."
                actions={(
                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={handleOpenCreateModal}
                    >
                        + Invitar usuario
                    </button>
                )}
            >
                <div className="admin-grid admin-grid-2">
                    {/* Eliminamos el formulario y mostramos solo la tabla */}
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
                                                    <button 
                                                        className="admin-btn admin-btn-ghost" 
                                                        onClick={() => handleOpenEditModal(u)}
                                                    >
                                                        Editar
                                                    </button>
                                                    {/* Admin Restaurante puede eliminar usuarios (excepto Super Admin) */}
                                                    {u.role !== 'admin' && (
                                                        <button 
                                                            className="admin-btn admin-btn-primary" 
                                                            onClick={() => handleDelete(u.id, u.username)}
                                                        >
                                                            Dar de Baja
                                                        </button>
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

            {/* Modal de usuario */}
            <UsuarioModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                editing={editing}
                form={form}
                setForm={setForm}
                restaurantes={restaurantes}
                loading={submitting}
            />
        </>
    );
}