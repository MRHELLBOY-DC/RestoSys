import { useState } from "react";
import { registerUser } from "../services/api";
import { Link } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("cliente");

    const handleRegister = async () => {
        const data = await registerUser({ username, password, role });

        if (data.id) {
            alert("Usuario creado");
        } else {
            alert("Error al registrar");
        }
    };

    return (
        <div className="card">
            <h2>Registro</h2>
            <input placeholder="Usuario" onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

            <select onChange={e => setRole(e.target.value)}>
                <option value="cliente">Cliente</option>
                <option value="restaurante">Restaurante</option>
            </select>

            <button onClick={handleRegister}>Registrar</button>
            <p>¿Ya tienes cuenta?</p>
            <Link to="/">Iniciar sesión</Link>
        </div>
    );
}