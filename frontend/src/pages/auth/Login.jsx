import { useState } from "react";
import { loginUser } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer"; 

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");
        const result = await loginUser({ email, password });

        if (result.success) {
            if (result.user.role === 'admin') navigate("/admin/dashboard");
            else if (result.user.role === 'restaurante') navigate("/admin/dashboard");  // ← Admin Restaurante al panel ADMIN
            else if (result.user.role === 'empleado') navigate("/restaurante/dashboard");
            else navigate("/cliente/dashboard");
        } else {
            setError(result.message || "Error en login");
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column"
             style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.35) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
            <Navbar />

            <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
                <div className="card shadow-lg text-white"
                     style={{
                         maxWidth: '420px',
                         width: '100%',
                         background: 'rgba(255,255,255,0.05)',
                         backdropFilter: 'blur(16px)',
                         border: '1px solid rgba(240,85,77,0.25)',
                         borderRadius: '24px',
                     }}>

                    <div className="card-body p-4 p-sm-5">
                        <div className="text-center mb-4">
                            <img src="/restosyslogo.png" alt="RestoSys" style={{ width: '140px', mixBlendMode: 'screen' }} className="mb-3" />
                            <h2 className="fw-bold">Iniciar sesión</h2>
                            <p className="text-white-50 small">Bienvenido de vuelta</p>
                        </div>

                        {error && (
                            <div className="alert py-2 small border-0 text-white mb-3"
                                 style={{ background: 'rgba(240,85,77,0.2)', borderRadius: '10px' }}>
                                {error}
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="text-white-50 small fw-semibold mb-1 d-block">Correo Electrónico</label>
                            <input
                                type="email"
                                className="form-control text-white"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 16px' }}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-white-50 small fw-semibold mb-1 d-block">Contraseña</label>
                            <input
                                type="password"
                                className="form-control text-white"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 16px' }}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn w-100 fw-bold py-2 mb-4 text-white"
                            style={{ background: 'linear-gradient(135deg, #f0554d 0%, #d73a35 100%)', border: 'none', borderRadius: '12px', fontSize: '1rem' }}
                            onClick={handleLogin}
                        >
                            Ingresar →
                        </button>

                        <div className="text-center small">
                            <span className="text-white-50">¿No tienes cuenta? </span>
                            <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#f0554d' }}>
                                Registrarse
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
