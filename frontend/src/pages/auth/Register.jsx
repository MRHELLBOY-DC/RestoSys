import { useState } from "react";
import { registerUser } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
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
                        <h2 className="fw-bold">Crear cuenta</h2>
                        <p className="text-white-50 small">Regístrate y empieza a pedir</p>
                    </div>

                    {error && (
                        <div className="alert py-2 small border-0 text-white mb-3"
                             style={{ background: 'rgba(240,85,77,0.2)', borderRadius: '10px' }}>
                            {error}
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="text-white-50 small fw-semibold mb-1 d-block">Nombre Completo</label>
                        <input
                            type="text"
                            className="form-control text-white"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 16px' }}
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                        />
                    </div>

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
                        onClick={handleRegister}
                    >
                        Registrarse →
                    </button>

                    <div className="text-center small">
                        <span className="text-white-50">¿Ya tienes cuenta? </span>
                        <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#f0554d' }}>
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>
            </div>

            <footer style={{ background: 'linear-gradient(135deg, rgba(30,8,8,0.95) 0%, rgba(15,5,5,0.98) 100%)', borderTop: '1px solid rgba(240,85,77,0.2)', padding: '20px 0', textAlign: 'center' }}>
                <p className="text-white-50 mb-1 small">© 2026 RestoSys - Todos los derechos reservados</p>
                <div className="small text-white-50">
                    <span>Luis Alfredo Vargas Pizarro</span> | <span>Eduardo Durana</span>
                </div>
            </footer>
        </div>
    );
}
