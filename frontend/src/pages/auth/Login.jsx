import { useState } from "react";
import { loginUser } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../../styles/client-theme.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");
        setSubmitting(true);
        try {
            const result = await loginUser({ email, password });
            if (result.success) {
                if (result.user.role === 'admin') navigate("/admin/dashboard");
                else if (result.user.role === 'restaurante') navigate("/admin/dashboard");  // ← Admin Restaurante al panel ADMIN
                else if (result.user.role === 'empleado') navigate("/restaurante/dashboard");
                else navigate("/cliente/dashboard");
            } else {
                setError(result.message || "Error en login");
            }
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
                        <h2 className="client-title h3 mb-1">Iniciar sesión</h2>
                        <p className="client-muted small mb-0">Bienvenido de vuelta</p>
                    </div>

                    {error && (
                        <div className="alert py-2 small border-0 mb-3" style={{ background: '#fff0ef', color: '#9d221c', borderRadius: 10 }}>
                            {error}
                        </div>
                    )}

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
                        onClick={handleLogin}
                        disabled={submitting}
                    >
                        {submitting
                            ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Ingresando...</>
                            : 'Ingresar →'}
                    </button>

                    <div className="text-center small client-muted">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#e4531f' }}>
                            Registrarse
                        </Link>
                    </div>
                </div>
            </div>

            <Footer light />
        </div>
    );
}
