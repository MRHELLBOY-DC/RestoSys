import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {getAdminRestaurantes, createRestaurante, updateRestaurante, deleteRestaurante } from "../../services/api";
import AdminShell from "../../components/AdminShell";

export default function AdminRestaurantes() {
    const {loading: authLoading } = useAuth(['admin']);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const formRef = useRef(null);
    const [form, setForm] = useState({
        name: "",
        address: ""
    });

    useEffect(() => {
        if (!authLoading) {
            loadData();
        }
    }, [authLoading]);

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

    const handleNew = () => {
        setEditing(null);
        setForm({ name: "", address: "" });
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (loading) return (
        <div className="admin-loading">
            <div className="d-flex align-items-center gap-2">
                <div className="spinner-border" role="status"></div>
                <span>Cargando restaurantes...</span>
            </div>
        </div>
    );

    return (
        <AdminShell
            title="Restaurantes"
            subtitle="Registra, edita o pausa establecimientos en la red."
            actions={(
                <button type="button" className="admin-btn admin-btn-primary" onClick={handleNew}>
                    + Nuevo restaurante
                </button>
            )}
        >
            <div className="admin-grid admin-grid-2">
                <div ref={formRef} className="admin-card admin-card--glass">
                    <h3 className="h5 fw-bold mb-4">{editing ? "Editar" : "Nuevo"} Restaurante</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Nombre</label>
                            <input
                                type="text"
                                className="form-control admin-input"
                                placeholder="Ej: La Pizzeria"
                                value={form.name}
                                onChange={e => setForm({...form, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold">Direccion</label>
                            <input
                                type="text"
                                className="form-control admin-input"
                                placeholder="Ej: Av. Principal 123"
                                value={form.address}
                                onChange={e => setForm({...form, address: e.target.value})}
                            />
                        </div>
                        <div className="d-grid gap-2">
                            <button type="submit" className="admin-btn admin-btn-primary">
                                {editing ? "Actualizar" : "Crear"}
                            </button>
                            {editing && (
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-ghost"
                                    onClick={() => {
                                        setEditing(null);
                                        setForm({ name: "", address: "" });
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
                            <h3 className="h5 fw-bold mb-1">Restaurantes registrados</h3>
                            <small className="admin-subtitle">{restaurantes.length} establecimientos</small>
                        </div>
                    </div>
                    {restaurantes.length === 0 ? (
                        <div className="admin-surface text-center text-white-50">
                            <p className="mb-0">No hay restaurantes registrados. Crea el primero.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Direccion</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {restaurantes.map(r => (
                                        <tr key={r.id}>
                                            <td className="fw-semibold">{r.id}</td>
                                            <td>{r.name}</td>
                                            <td className="text-white-50">{r.address || "Sin direccion"}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button className="admin-btn admin-btn-ghost" onClick={() => {
                                                        setEditing(r.id);
                                                        setForm({ name: r.name, address: r.address || "" });
                                                    }}>Editar</button>
                                                    <button className="admin-btn admin-btn-primary" onClick={() => handleDelete(r.id, r.name)}>Eliminar</button>
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
        </AdminShell>
    );
}