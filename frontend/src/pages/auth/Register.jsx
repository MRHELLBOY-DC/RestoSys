import { useState } from "react";
import { registerUser } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../../styles/client-theme.css";

export default function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        setError("");

        if (!fullName.trim()) { setError("El nombre completo es requerido"); return; }
        if (fullName.trim().length > 100) { setError("El nombre no puede tener más de 100 caracteres"); return; }
        if (!email.trim()) { setError("El correo electrónico es requerido"); return; }
        if (!email.includes('@') || !email.includes('.')) { setError("Ingresa un correo electrónico válido"); return; }
        if (email.length > 100) { setError("El correo no puede tener más de 100 caracteres"); return; }
        if (!password) { setError("La contraseña es requerida"); return; }
        if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
        if (password.length > 128) { setError("La contraseña no puede tener más de 128 caracteres"); return; }

        const data = {
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
            role: "cliente",
        };

        setSubmitting(true);
        try {
            const result = await registerUser(data);

            if (result.id) {
                alert("Usuario creado exitosamente");
                navigate("/login");
            } else {
                setError(result.email || result.error || result.message || "Error al registrar usuario");
            }
        } catch (err) {
            const errorMsg = err.data?.email ||
                         err.data?.username ||
                         err.data?.error ||
                         err.message ||
                         "Error al registrar usuario";
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="client-shell d-flex flex-column" style={{ minHeight: '100vh' }}>
            <Navbar />

            <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
                <div className="client-hero p-4 p-sm-5" style={{ maxWidth: '420px', width: '100%' }}>
                    <div className="text-center mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center mb-3"
                            style={{ width: 56, height: 56, borderRadius: 16, background: '#e4531f', color: '#fff', fontWeight: 800, fontSize: 26 }}
                        >
                            R
                        </div>
                        <h2 className="client-title h3 mb-1">Crear cuenta</h2>
                        <p className="client-muted small mb-0">Regístrate y empieza a pedir</p>
                    </div>

                    {error && (
                        <div className="alert py-2 small border-0 mb-3" style={{ background: '#fff0ef', color: '#9d221c', borderRadius: 10 }}>
                            {error}
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="client-muted small fw-semibold mb-1 d-block">Nombre completo</label>
                        <input
                            type="text"
                            className="form-control py-2"
                            style={{ borderColor: '#ebe1d5', borderRadius: 12 }}
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="client-muted small fw-semibold mb-1 d-block">Correo electrónico</label>
                        <input
                            type="email"
                            className="form-control py-2"
                            style={{ borderColor: '#ebe1d5', borderRadius: 12 }}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="client-muted small fw-semibold mb-1 d-block">Contraseña</label>
                        <input
                            type="password"
                            className="form-control py-2"
                            style={{ borderColor: '#ebe1d5', borderRadius: 12 }}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn client-button w-100 py-2 mb-4"
                        onClick={handleRegister}
                        disabled={submitting}
                    >
                        {submitting
                            ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Creando cuenta...</>
                            : 'Registrarse →'}
                    </button>

                    <div className="text-center small client-muted">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#e4531f' }}>
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>

            <Footer light />
        </div>
    );
}
