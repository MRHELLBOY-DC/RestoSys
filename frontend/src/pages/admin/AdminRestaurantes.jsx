import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getAdminRestaurantes, createRestaurante, updateRestaurante, deleteRestaurante, getCurrentUser } from "../../services/api";
import AdminShell from "../../components/AdminShell";
import RestauranteModal from "../../components/modals/RestauranteModal";
import { authMediaUrl } from "../../services/mediaUrl";

export default function AdminRestaurantes() {
    const { loading: authLoading } = useAuth(['admin', 'restaurante']);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        lat: null,
        lng: null,
        delivery_fee: "",
        logo: null
    });

    // Obtener usuario autenticado para determinar permisos
    const currentUser = getCurrentUser();
    const isSuperAdmin = currentUser?.role === 'admin';
    const isAdminRestaurante = currentUser?.role === 'restaurante';

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
        formData.append("phone", form.phone);
        if (form.lat != null) formData.append("lat", form.lat);
        if (form.lng != null) formData.append("lng", form.lng);
        if (form.delivery_fee !== "") formData.append("delivery_fee", form.delivery_fee);
        if (form.logo) {
            formData.append("logo", form.logo);
        }

        try {
            if (editing) {
                await updateRestaurante(editing, formData);
            } else {
                await createRestaurante(formData);
            }
            setForm({ name: "", address: "", phone: "", lat: null, lng: null, delivery_fee: "", logo: null });
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
        setForm({ name: "", address: "", phone: "", lat: null, lng: null, delivery_fee: "", logo: null });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditing(null);
        setForm({ name: "", address: "", phone: "", lat: null, lng: null, delivery_fee: "", logo: null });
    };

    // Filtrar restaurantes si es Admin Restaurante (solo ve su restaurante)
    const filteredRestaurantes = isAdminRestaurante
        ? restaurantes.filter(r => r.id === currentUser.restaurant_id)
        : restaurantes;

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
                    isSuperAdmin && (
                        <button type="button" className="admin-btn admin-btn-primary" onClick={handleNew}>
                            + Nuevo restaurante
                        </button>
                    )
                )}
            >
                <div className="admin-grid admin-grid-1">
                    <div className="admin-card admin-card--glass">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h3 className="h5 fw-bold mb-1">Restaurantes registrados</h3>
                                <small className="admin-subtitle">{filteredRestaurantes.length} establecimientos</small>
                            </div>
                        </div>
                        {filteredRestaurantes.length === 0 ? (
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
                                            <th>Telefono</th>
                                            <th>Costo envio</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRestaurantes.map(r => (
                                            <tr key={r.id}>
                                                <td className="fw-semibold">{r.id}</td>
                                                <td>
                                                    {r.logo ? (
                                                        <img
                                                            src={authMediaUrl(r.logo)}
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
                                                <td style={{ color: 'var(--admin-muted)' }}>{r.address || "Sin direccion"}</td>
                                                <td style={{ color: 'var(--admin-muted)' }}>{r.phone || "Sin telefono"}</td>
                                                <td style={{ color: 'var(--admin-muted)' }}>{r.delivery_fee != null ? `Bs ${Number(r.delivery_fee).toFixed(2)}` : "Sin costo"}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        {(isSuperAdmin || (isAdminRestaurante && r.id === currentUser.restaurant_id)) && (
                                                            <button className="admin-btn admin-btn-ghost" onClick={() => {
                                                                setEditing(r.id);
                                                                setForm({ name: r.name, address: r.address || "", phone: r.phone || "", lat: r.lat ?? null, lng: r.lng ?? null, delivery_fee: r.delivery_fee ?? "", logo: null });
                                                                setIsModalOpen(true);
                                                            }}>Editar</button>
                                                        )}
                                                        {isSuperAdmin && (
                                                            <button className="admin-btn admin-btn-primary" onClick={() => handleDelete(r.id, r.name)}>Eliminar</button>
                                                        )}
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