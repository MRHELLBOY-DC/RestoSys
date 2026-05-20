import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { 
    getAdminUsuarios, 
    getAdminRestaurantes, 
    createAdminUsuario, 
    updateAdminUsuario, 
    deleteAdminUsuario, 
    asignarRestaurante 
} from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";

export default function AdminUsuarios() {
    const { loading: authLoading } = useAuth(['admin']);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const isCliente = form.role === 'cliente';
            if (editing) {
                const updateData = { username: form.username, role: form.role };
                if (!isCliente) updateData.restaurante_id = form.restaurante_id;
                await updateAdminUsuario(editing, updateData);
            } else {
                const createData = {
                    username: form.username,
                    password: form.password,
                    role: form.role,
                };
                if (!isCliente) createData.restaurante_id = form.restaurante_id;
                await createAdminUsuario(createData);
            }
            setForm({ username: "", password: "", role: "cliente", restaurante_id: "" });
            setEditing(null);
            loadData();
        } catch (error) {
            alert("Error al guardar: " + error.message);
        }
    };

    const handleDelete = async (id, username) => {
        if (window.confirm(`¿Eliminar el usuario "${username}"?`)) {
            try {
                await deleteAdminUsuario(id);
                loadData();
            } catch (error) {
                console.error("Error al eliminar:", error); 
                alert("Error al eliminar");
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
            default: return 'bg-info text-dark';
        }
    };

    if (loading) return (
        <div className="min-vh-100 d-flex flex-column bg-dark">
            <DashboardNavbar />
            <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                <div className="spinner-border text-light me-3" role="status"></div>
                <span>Sincronizando usuarios...</span>
            </div>
        </div>
    );

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
            <DashboardNavbar />
            
            <div className="container py-4">
                <div className="row g-4">
                    {/* Panel de Formulario */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-lg bg-white bg-opacity-10 text-white" style={{ backdropFilter: 'blur(15px)', borderRadius: '20px' }}>
                            <div className="card-body p-4">
                                <h3 className="h5 fw-bold mb-4">{editing ? "Editar" : "Nuevo"} Usuario</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold text-white-50">Username</label>
                                        <input
                                            type="text"
                                            className="form-control bg-dark bg-opacity-25 border-secondary text-white"
                                            value={form.username}
                                            onChange={e => setForm({...form, username: e.target.value})}
                                            required
                                        />
                                    </div>

                                    {!editing && (
                                        <div className="mb-3">
                                            <label className="form-label small fw-semibold text-white-50">Contraseña</label>
                                            <input
                                                type="password"
                                                className="form-control bg-dark bg-opacity-25 border-secondary text-white"
                                                value={form.password}
                                                onChange={e => setForm({...form, password: e.target.value})}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold text-white-50">Rol de Acceso</label>
                                        <select
                                            className="form-select bg-dark bg-opacity-25 border-secondary text-white"
                                            value={form.role}
                                            onChange={e => setForm({...form, role: e.target.value, restaurante_id: e.target.value === 'cliente' ? "" : form.restaurante_id})}
                                        >
                                            <option value="cliente" className="bg-dark text-white">Cliente</option>
                                            <option value="restaurante" className="bg-dark text-white">Restaurante</option>
                                            <option value="admin" className="bg-dark text-white">Administrador</option>
                                        </select>
                                    </div>

                                    {form.role !== 'cliente' && (
                                        <div className="mb-4 animate__animated animate__fadeIn">
                                            <label className="form-label small fw-semibold text-white-50">Asignar Sede</label>
                                            <select
                                                className="form-select bg-dark bg-opacity-25 border-secondary text-white"
                                                value={form.restaurante_id}
                                                onChange={e => setForm({...form, restaurante_id: e.target.value})}
                                            >
                                                <option value="" className="bg-dark text-white">Sin restaurante asignado</option>
                                                {restaurantes.map(r => (
                                                    <option key={r.id} value={r.id} className="bg-dark text-white">{r.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="d-grid gap-2 mt-4">
                                        <button type="submit" className="btn btn-primary fw-bold py-2 shadow">
                                            {editing ? "Guardar Cambios" : "Registrar Usuario"}
                                        </button>
                                        {editing && (
                                            <button type="button" className="btn btn-outline-light btn-sm border-0" onClick={() => {
                                                setEditing(null);
                                                setForm({ username: "", password: "", role: "cliente", restaurante_id: "" });
                                            }}>Cancelar</button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Panel de Tabla */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-lg bg-white bg-opacity-10 text-white overflow-hidden" style={{ backdropFilter: 'blur(15px)', borderRadius: '20px' }}>
                            <div className="table-responsive">
                                <table className="table table-dark table-hover mb-0 align-middle">
                                    <thead className="bg-white bg-opacity-10">
                                        <tr>
                                            <th className="px-4 py-3 border-0 small text-uppercase opacity-50">Usuario</th>
                                            <th className="py-3 border-0 small text-uppercase opacity-50">Rol</th>
                                            <th className="py-3 border-0 small text-uppercase opacity-50">Sede Asignada</th>
                                            <th className="px-4 py-3 border-0 small text-uppercase opacity-50 text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {usuarios.map(u => (
                                            <tr key={u.id} className="border-bottom border-white border-opacity-10">
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="rounded-circle bg-primary bg-opacity-25 p-2 text-primary fw-bold" style={{ width: '40px', height: '40px', display: 'grid', placeContent: 'center' }}>
                                                            {u.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="fw-semibold">{u.username}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`badge rounded-pill ${getBadgeColor(u.role)}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    {u.role === 'cliente' ? (
                                                        <small className="text-muted">Acceso QR</small>
                                                    ) : u.restaurant?.name ? (
                                                        <span className="small text-white-50">{u.restaurant.name}</span>
                                                    ) : (
                                                        <select 
                                                            className="form-select form-select-sm bg-transparent border-secondary text-white-50"
                                                            onChange={(e) => handleAsignarRestaurante(u.id, e.target.value)}
                                                            defaultValue=""
                                                            style={{ maxWidth: '150px' }}
                                                        >
                                                            <option value="" className="bg-dark">Asignar...</option>
                                                            {restaurantes.map(r => (
                                                                <option key={r.id} value={r.id} className="bg-dark text-white">{r.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-end">
                                                    <div className="btn-group">
                                                        <button className="btn btn-sm btn-outline-light border-opacity-25" onClick={() => {
                                                            setEditing(u.id);
                                                            setForm({
                                                                username: u.username,
                                                                password: "",
                                                                role: u.role,
                                                                restaurante_id: u.restaurant?.id || ""
                                                            });
                                                        }}>Editar</button>
                                                        <button className="btn btn-sm btn-outline-danger border-opacity-25" onClick={() => handleDelete(u.id, u.username)}>Eliminar</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}