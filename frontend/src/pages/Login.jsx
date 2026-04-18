import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        const data = await loginUser({ username, password });

        if (data.access) {
            localStorage.setItem("token", data.access);
            alert("Login exitoso");
            navigate("/dashboard");
        } else {
            alert("Error en login");
        }
    };

    return (
        <div className="card">
            <h2>Login</h2>
            <input placeholder="Usuario" onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Ingresar</button>
            <p>No tienes cuenta?</p>
            <Link to="/register">Registrarse</Link>
        </div>
    );
}