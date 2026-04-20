import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");
        const result = await loginUser({ username, password });

        if (result.success) {
            alert(`Bienvenido ${result.user.username}`);

            // Redirigir según el rol
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
        <div className="card">
            <h2>Login</h2>
            {error && <div className="error">{error}</div>}
            <input 
                placeholder="Usuario" 
                onChange={e => setUsername(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                onChange={e => setPassword(e.target.value)} 
            />
            <button onClick={handleLogin}>Ingresar</button>
            <p>No tienes cuenta?</p>
            <Link to="/register">Registrarse</Link>
        </div>
    );
}