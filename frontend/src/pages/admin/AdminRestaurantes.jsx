import { useEffect, useState } from "react";
import { getCurrentUser, getAdminRestaurantes, createRestaurante, updateRestaurante, deleteRestaurante } from "../../services/api";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../../components/DashboardNavbar";

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
    }, [navigate]);

    const loadData = async () => {
        try {
            const data = await getAdminRestaurantes();
            setRestaurantes(data);
        } catch (error) {
            console.error("Error loading restaurantes:", error);
            alert("Error al cargar restaurantes");
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
            } else {
                await createRestaurante({
                    name: form.name,
                    address: form.address
                });
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
                loadData();
            } catch (error) {
                console.error("Error:", error);
                alert("Error al eliminar");
            }
        }
    };

    if (loading) return (
        <div className="min-vh-100 w-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <DashboardNavbar />
            <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                <div className="spinner-border me-2" role="status"></div>
                <span>Cargando restaurantes...</span>
            </div>
        </div>
    );

    return (
        <div className="min-vh-100 w-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <DashboardNavbar />
            
            <div className="container py-4 flex-grow-1">
                {/* Botón Volver */}
                <button 
                    onClick={() => navigate("/admin/dashboard")} 
                    className="btn btn-link text-white text-decoration-none mb-4 p-0 d-flex align-items-center gap-2"
                >
                    <span className="fs-4">←</span> Volver al Dashboard
                </button>

                <div className="row g-4">
                    {/* Formulario Lateral */}
                    <div className="col-12 col-lg-4">
                        <div className="card border-0 shadow-lg bg-white bg-opacity-10 text-white" style={{ backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                            <div className="card-body p-4">
                                <h3 className="h5 fw-bold mb-4">{editing ? "Editar" : "Nuevo"} Restaurante</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Nombre</label>
                                        <input
                                            type="text"
                                            className="form-control bg-white bg-opacity-10 border-white border-opacity-25 text-white placeholder-white-50"
                                            placeholder="Ej: La Pizzería"
                                            value={form.name}
                                            onChange={e => setForm({...form, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold">Dirección</label>
                                        <input
                                            type="text"
                                            className="form-control bg-white bg-opacity-10 border-white border-opacity-25 text-white placeholder-white-50"
                                            placeholder="Ej: Av. Principal 123"
                                            value={form.address}
                                            onChange={e => setForm({...form, address: e.target.value})}
                                        />
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-light fw-bold">
                                            {editing ? "Actualizar" : "Crear"}
                                        </button>
                                        {editing && (
                                            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => {
                                                setEditing(null);
                                                setForm({ name: "", address: "" });
                                            }}>
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Datos */}
                    <div className="col-12 col-lg-8">
                        <div className="card border-0 shadow-lg bg-white bg-opacity-10 text-white h-100" style={{ backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                            <div className="card-body p-4">
                                <h3 className="h5 fw-bold mb-4 text-center text-lg-start">Restaurantes Existentes</h3>
                                
                                {restaurantes.length === 0 ? (
                                    <div className="text-center py-5 text-white-50">
                                        <p>No hay restaurantes registrados. ¡Crea el primero!</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover table-borderless align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                                            <thead>
                                                <tr className="border-bottom border-white border-opacity-10">
                                                    <th className="py-3 text-white-50 small text-uppercase">ID</th>
                                                    <th className="py-3 text-white-50 small text-uppercase">Nombre</th>
                                                    <th className="py-3 text-white-50 small text-uppercase">Dirección</th>
                                                    <th className="py-3 text-white-50 small text-uppercase text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {restaurantes.map(r => (
                                                    <tr key={r.id} className="border-bottom border-white border-opacity-10">
                                                        <td className="py-3 fw-bold">{r.id}</td>
                                                        <td className="py-3">{r.name}</td>
                                                        <td className="py-3 text-white-50 small">{r.address || "Sin dirección"}</td>
                                                        <td className="py-3 text-center">
                                                            <div className="btn-group btn-group-sm shadow-sm">
                                                                <button className="btn btn-outline-light px-3" onClick={() => {
                                                                    setEditing(r.id);
                                                                    setForm({ name: r.name, address: r.address || "" });
                                                                }}>Editar</button>
                                                                <button className="btn btn-danger px-3 bg-danger bg-opacity-75 border-0" onClick={() => handleDelete(r.id, r.name)}>Eliminar</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}