import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { 
    getAdminUsuarios, 
    getAdminRestaurantes, 
    createAdminUsuario, 
    updateAdminUsuario, 
    deleteAdminUsuario, 
    asignarRestaurante,
    getCurrentUser
} from "../../services/api";
import AdminShell from "../../components/AdminShell";
import UsuarioModal from "../../components/modals/UsuarioModal"; // Importar el modal

export default function AdminUsuarios() {
    const { loading: authLoading } = useAuth(['admin']);
    const [usuarios, setUsuarios] = useState([]);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [modalOpen, setModalOpen] = useState(false); // Estado para controlar el modal
    const [submitting, setSubmitting] = useState(false); // Estado para el submit
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        role: "cliente",
        restaurante_id: ""
    });

    // Obtener usuario autenticado
    const currentUser = getCurrentUser();
    const isSuperAdmin = currentUser?.role === 'admin';

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

    // Abrir modal para crear
    const handleOpenCreateModal = () => {
        setEditing(null);
        setForm({ 
            full_name: "", 
            email: "", 
            password: "", 
            role: "cliente", 
            restaurante_id: ""
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
            restaurante_id: usuario.restaurant?.id || usuario.restaurant_id || ""
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
            if (editing) {
                const updateData = {
                    username: usernameFromName(form.full_name, form.email),
                    full_name: form.full_name,
                    email: form.email,
                    role: form.role
                };
                if (form.role !== 'cliente' && form.restaurante_id) {
                    updateData.restaurante_id = form.restaurante_id;
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
                if (form.role !== 'cliente' && form.restaurante_id) {
                    createData.restaurante_id = form.restaurante_id;
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
                subtitle="Control de roles y cuentas de la plataforma."
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
                    {/* Tabla de usuarios (sin el formulario) */}
                    <div className="admin-card admin-card--glass">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h3 className="h5 fw-bold mb-1">Usuarios registrados</h3>
                                <small className="admin-subtitle">{usuarios.length} cuentas activas</small>
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
                                    {usuarios.map(u => (
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
                                                {(u.role === 'cliente' || u.role === 'admin') ? (
                                                    <small style={{ color: 'var(--admin-muted)' }}>No aplica</small>
                                                ) : u.restaurant?.name ? (
                                                    <span className="small" style={{ color: 'var(--admin-muted)' }}>{u.restaurant.name}</span>
                                                ) : u.restaurant_id ? (
                                                    <span className="small" style={{ color: 'var(--admin-muted)' }}>Restaurante ID: {u.restaurant_id}</span>
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
                                                    <button 
                                                        className="admin-btn admin-btn-primary" 
                                                        onClick={() => handleDelete(u.id, u.username)}
                                                    >
                                                        Dar de Baja
                                                    </button>
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