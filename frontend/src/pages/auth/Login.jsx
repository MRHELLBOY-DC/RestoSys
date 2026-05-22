import { useState } from "react";
import { loginUser } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");
        const result = await loginUser({ email, password });

        if (result.success) {
            if (result.user.role === 'admin') {
                navigate("/admin/dashboard");
            } else if (result.user.role === 'restaurante') {
                navigate("/restaurante/dashboard");
            } else {
                navigate("/cliente/dashboard");
            }
        } else {
            setError(result.message || "Error en login");
        }
    };

    return (
        /* Contenedor principal que ocupa toda la pantalla con el degradado */
        <div className="min-vh-100 w-100 d-flex align-items-center justify-content-center p-3"
             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            
            {/* Tarjeta de Login (Glassmorphism) */}
            <div className="card shadow-lg border-white border-opacity-25 text-white" 
                 style={{ 
                     maxWidth: '400px', 
                     width: '100%', 
                     background: 'rgba(255, 255, 255, 0.1)', 
                     backdropFilter: 'blur(15px)',
                     borderRadius: '20px'
                 }}>
                
                <div className="card-body p-5 text-center">
                    <h2 className="fw-bold mb-4">Iniciar Sesión</h2>
                    
                    {error && (
                        <div className="alert alert-danger py-2 small border-0 bg-danger bg-opacity-25 text-white" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="mb-3">
                        <input 
                            type="email"
                            className="form-control bg-white bg-opacity-10 border-white border-opacity-25 text-white placeholder-white-50"
                            placeholder="Correo electrónico" 
                            style={{ borderRadius: '10px' }}
                            value={email}
                            onChange={e => setEmail(e.target.value)} 
                        />
                    </div>

                    <div className="mb-4">
                        <input 
                            type="password" 
                            className="form-control bg-white bg-opacity-10 border-white border-opacity-25 text-white placeholder-white-50"
                            placeholder="Contraseña" 
                            style={{ borderRadius: '10px' }}
                            value={password}
                            onChange={e => setPassword(e.target.value)} 
                        />
                    </div>

                    <button 
                        className="btn btn-primary w-100 fw-bold mb-4 py-2 shadow-sm"
                        style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            border: 'none',
                            borderRadius: '10px'
                        }}
                        onClick={handleLogin}
                    >
                        Ingresar
                    </button>

                    <div className="small">
                        <p className="mb-1 text-white-50">¿No tienes cuenta?</p>
                        <Link to="/register" className="text-white fw-bold text-decoration-none">
                            Registrarse
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
