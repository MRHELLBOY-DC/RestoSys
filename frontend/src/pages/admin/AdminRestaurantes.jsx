import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getAdminRestaurantes, createRestaurante, updateRestaurante, deleteRestaurante } from "../../services/api";
import AdminShell from "../../components/AdminShell";
import RestauranteModal from "../../components/modals/RestauranteModal";

export default function AdminRestaurantes() {
    const { loading: authLoading } = useAuth(['admin']);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [form, setForm] = useState({
        name: "",
        address: "",
        logo: null
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

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("address", form.address);
        if (form.logo) {
            formData.append("logo", form.logo);
        }
        
        try {
            if (editing) {
                await updateRestaurante(editing, formData);
            } else {
                await createRestaurante(formData);
            }
            setForm({ name: "", address: "", logo: null });
            setEditing(null);
            setIsModalOpen(false);
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
        setForm({ name: "", address: "", logo: null });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditing(null);
        setForm({ name: "", address: "", logo: null });
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
        <>
            <AdminShell
                title="Restaurantes"
                subtitle="Registra, edita o pausa establecimientos en la red."
                actions={(
                    <button type="button" className="admin-btn admin-btn-primary" onClick={handleNew}>
                        + Nuevo restaurante
                    </button>
                )}
            >
                <div className="admin-grid admin-grid-1">
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
                                            <th>Logo</th>
                                            <th>Nombre</th>
                                            <th>Direccion</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {restaurantes.map(r => (
                                            <tr key={r.id}>
                                                <td className="fw-semibold">{r.id}</td>
                                                <td>
                                                    {r.logo ? (
                                                        <img
                                                            src={`http://localhost:8000${r.logo}`}
                                                            alt={r.name}
                                                            style={{ 
                                                                width: 40, 
                                                                height: 40, 
                                                                objectFit: 'cover', 
                                                                borderRadius: '50%',
                                                                border: '1px solid rgba(255,255,255,0.1)'
                                                            }}
                                                            onError={(e) => { 
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = '<span style="font-size:20px">🍽️</span>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: '20px' }}>🍽️</span>
                                                    )}
                                                </td>
                                                <td>{r.name}</td>
                                                <td className="text-white-50">{r.address || "Sin direccion"}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button className="admin-btn admin-btn-ghost" onClick={() => {
                                                            setEditing(r.id);
                                                            setForm({ name: r.name, address: r.address || "", logo: null });
                                                            setIsModalOpen(true);
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

            <RestauranteModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                editing={editing}
                form={form}
                setForm={setForm}
            />
        </>
    );
}