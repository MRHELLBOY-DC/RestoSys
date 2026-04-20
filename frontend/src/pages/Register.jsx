import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("cliente");
    const [restaurantName, setRestaurantName] = useState("");
    const [restaurantAddress, setRestaurantAddress] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        const data = { username, password, role };
        
        // Si es restaurante, enviar datos del restaurante
        if (role === 'restaurante') {
            data.restaurant_name = restaurantName;
            data.restaurant_address = restaurantAddress;
        }
        
        const result = await registerUser(data);

        if (result.id) {
            alert("Usuario creado exitosamente");
            navigate("/login");
        } else {
            alert("Error al registrar: " + JSON.stringify(result));
        }
    };

    return (
        <div className="card">
            <h2>Registro</h2>
            <input 
                placeholder="Usuario" 
                onChange={e => setUsername(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                onChange={e => setPassword(e.target.value)} 
            />

            <select onChange={e => setRole(e.target.value)}>
                <option value="cliente">Cliente</option>
                <option value="restaurante">Restaurante</option>
                <option value="admin">Admin</option>
            </select>

            {role === 'restaurante' && (
                <>
                    <input 
                        placeholder="Nombre del Restaurante" 
                        onChange={e => setRestaurantName(e.target.value)} 
                    />
                    <input 
                        placeholder="Dirección del Restaurante" 
                        onChange={e => setRestaurantAddress(e.target.value)} 
                    />
                </>
            )}

            <button onClick={handleRegister}>Registrar</button>
            <p>¿Ya tienes cuenta?</p>
            <Link to="/login">Iniciar sesión</Link>
        </div>
    );
}