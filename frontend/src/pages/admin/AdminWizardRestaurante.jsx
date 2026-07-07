import { useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "../../components/AdminShell";
import { useAuth } from "../../hooks/useAuth";
import { createRestauranteWizard } from "../../services/api";
import AddressAutocompleteMap from "../../components/AddressAutocompleteMap";

const initialForm = {
    user_full_name: "",
    user_email: "",
    user_password: "",
    restaurant_name: "",
    restaurant_address: "",
    restaurant_phone: "",
    restaurant_lat: null,
    restaurant_lng: null,
    restaurant_delivery_fee: "",
    restaurant_logo: null,
};

const getErrorMessage = (err, fallback) => err?.error || err?.detail || err?.message || fallback;

export default function AdminWizardRestaurante() {
    const { user, loading } = useAuth(["admin"]);
    const [form, setForm] = useState(initialForm);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.user_full_name.trim() || !form.user_email.trim() || !form.user_password.trim()) {
            setError("Completa nombre, correo y contraseña del usuario.");
            return;
        }
        if (form.user_password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (!form.restaurant_name.trim()) {
            setError("El nombre del restaurante es obligatorio.");
            return;
        }

        setBusy(true);
        try {
            const formData = new FormData();
            formData.append("user_full_name", form.user_full_name);
            formData.append("user_email", form.user_email);
            formData.append("user_password", form.user_password);
            formData.append("restaurant_name", form.restaurant_name);
            formData.append("restaurant_address", form.restaurant_address);
            formData.append("restaurant_phone", form.restaurant_phone);
            if (form.restaurant_lat != null) formData.append("restaurant_lat", form.restaurant_lat);
            if (form.restaurant_lng != null) formData.append("restaurant_lng", form.restaurant_lng);
            if (form.restaurant_delivery_fee !== "") formData.append("restaurant_delivery_fee", form.restaurant_delivery_fee);
            if (form.restaurant_logo) {
                formData.append("restaurant_logo", form.restaurant_logo);
            }
            const data = await createRestauranteWizard(formData);
            setResult(data);
        } catch (err) {
            setError(getErrorMessage(err, "No se pudo completar el registro"));
        } finally {
            setBusy(false);
        }
    };

    const handleReset = () => {
        setForm(initialForm);
        setResult(null);
        setError("");
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="d-flex align-items-center gap-2">
                    <div className="spinner-border" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    if (result) {
        return (
            <AdminShell title="Registro asistido" subtitle="Restaurante registrado correctamente.">
                <div className="admin-card admin-card--glass" style={{ maxWidth: 560 }}>
                    <h2 className="h5 fw-bold mb-3 text-white">🪄 Todo listo</h2>
                    <p className="text-white-50 mb-3">
                        Se creó el usuario <strong className="text-white">{result.user.username}</strong> ({result.user.email})
                        con rol <strong className="text-white">Administrador de Restaurante</strong>, y quedó asignado
                        al restaurante <strong className="text-white">{result.restaurant.name}</strong>.
                    </p>
                    <div className="d-flex gap-2">
                        <button type="button" className="admin-btn admin-btn-primary" onClick={handleReset}>
                            Registrar otro
                        </button>
                        <Link to="/admin/restaurantes" className="admin-btn admin-btn-ghost text-decoration-none">
                            Ver restaurantes
                        </Link>
                    </div>
                </div>
            </AdminShell>
        );
    }

    return (
        <AdminShell
            title="Registro asistido"
            subtitle="Crea el usuario y el restaurante de una sola vez."
        >
            <div className="admin-card admin-card--glass" style={{ maxWidth: 560 }}>
                {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <h2 className="h6 fw-bold mb-3 text-white">Usuario del restaurante</h2>
                    <div className="mb-3">
                        <label className="form-label small text-white-50">Nombre completo</label>
                        <input
                            className="form-control admin-input"
                            placeholder="Ej: Juan Pérez"
                            value={form.user_full_name}
                            onChange={(e) => setForm({ ...form, user_full_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small text-white-50">Correo</label>
                        <input
                            type="email"
                            className="form-control admin-input"
                            placeholder="usuario@ejemplo.com"
                            value={form.user_email}
                            onChange={(e) => setForm({ ...form, user_email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label small text-white-50">Contraseña</label>
                        <input
                            type="password"
                            className="form-control admin-input"
                            placeholder="Mínimo 6 caracteres"
                            value={form.user_password}
                            onChange={(e) => setForm({ ...form, user_password: e.target.value })}
                            required
                        />
                    </div>

                    <hr className="border-secondary opacity-25 my-4" />

                    <h2 className="h6 fw-bold mb-3 text-white">Datos del restaurante</h2>
                    <div className="mb-3">
                        <label className="form-label small text-white-50">Nombre del restaurante</label>
                        <input
                            className="form-control admin-input"
                            placeholder="Ej: La Pizzeria"
                            value={form.restaurant_name}
                            onChange={(e) => setForm({ ...form, restaurant_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small text-white-50">Dirección</label>
                        <AddressAutocompleteMap
                            address={form.restaurant_address}
                            lat={form.restaurant_lat}
                            lng={form.restaurant_lng}
                            onChange={(partial) => setForm(prev => ({
                                ...prev,
                                ...(partial.address !== undefined ? { restaurant_address: partial.address } : {}),
                                ...(partial.lat !== undefined ? { restaurant_lat: partial.lat } : {}),
                                ...(partial.lng !== undefined ? { restaurant_lng: partial.lng } : {}),
                            }))}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small text-white-50">Teléfono</label>
                        <input
                            className="form-control admin-input"
                            placeholder="Ej: 70000000"
                            value={form.restaurant_phone}
                            onChange={(e) => setForm({ ...form, restaurant_phone: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small text-white-50">Costo de envío (delivery)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control admin-input"
                            placeholder="Ej: 5.00"
                            value={form.restaurant_delivery_fee}
                            onChange={(e) => setForm({ ...form, restaurant_delivery_fee: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label small text-white-50">Logo (opcional)</label>
                        <input
                            type="file"
                            className="form-control admin-input"
                            accept="image/*"
                            onChange={(e) => setForm({ ...form, restaurant_logo: e.target.files[0] })}
                        />
                    </div>

                    <button type="submit" className="admin-btn admin-btn-primary w-100" disabled={busy}>
                        {busy ? "Registrando..." : "Registrar restaurante"}
                    </button>
                </form>
            </div>
        </AdminShell>
    );
}
