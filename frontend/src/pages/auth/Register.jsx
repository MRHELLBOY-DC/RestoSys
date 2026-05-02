import { useState } from "react";
import { registerUser } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("cliente");
    const [restaurantName, setRestaurantName] = useState("");
    const [restaurantAddress, setRestaurantAddress] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        setError("");
        const data = { username, password, role };
        
        if (role === 'restaurante') {
            if (!restaurantName) {
                setError("El nombre del restaurante es requerido");
                return;
            }
            data.restaurant_name = restaurantName;
            data.restaurant_address = restaurantAddress;
        }
        
        const result = await registerUser(data);

        if (result.id) {
            alert("Usuario creado exitosamente");
            navigate("/login");
        } else {
            setError(result.message || "Error al registrar");
        }
    };

    return (
        <div className="min-vh-100 w-100 d-flex align-items-center justify-content-center p-3" 
             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            
            <div className="card shadow-lg border-white border-opacity-25 text-white" 
                 style={{ 
                     maxWidth: '450px', 
                     width: '100%', 
                     background: 'rgba(255, 255, 255, 0.1)', 
                     backdropFilter: 'blur(15px)',
                     borderRadius: '20px' 
                 }}>
                
                <div className="card-body p-4 p-sm-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">Registro</h2>
                        <p className="text-white-50 small">Crea tu cuenta personalizada</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger py-2 small border-0 bg-danger bg-opacity-25 text-white" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="mb-3">
                        <input 
                            type="text"
                            className="form-control bg-white bg-opacity-10 border-white border-opacity-25 text-white placeholder-white-50"
                            placeholder="Nombre de Usuario" 
                            style={{ borderRadius: '10px' }}
                            value={username}
                            onChange={e => setUsername(e.target.value)} 
                        />
                    </div>

                    <div className="mb-3">
                        <input 
                            type="password" 
                            className="form-control bg-white bg-opacity-10 border-white border-opacity-25 text-white placeholder-white-50"
                            placeholder="Contraseña" 
                            style={{ borderRadius: '10px' }}
                            value={password}
                            onChange={e => setPassword(e.target.value)} 
                        />
                    </div>

                    <div className="mb-4 text-start">
                        <label className="small mb-2 ms-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Tipo de Usuario</label>
                        <select 
                            className="form-select bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                            style={{ borderRadius: '10px', cursor: 'pointer' }}
                            value={role} 
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="cliente" className="text-dark">Soy Cliente</option>
                            <option value="restaurante" className="text-dark">Tengo un Restaurante</option>
                        </select>
                    </div>

                    {role === 'restaurante' && (
                        <div className="p-3 mb-4 rounded border border-white border-opacity-25 bg-white bg-opacity-5 animate__animated animate__fadeIn">
                            <div className="mb-3">
                                <input 
                                    type="text"
                                    className="form-control form-control-sm bg-white bg-opacity-10 border-white border-opacity-25 text-white placeholder-white-50"
                                    placeholder="Nombre del Negocio" 
                                    value={restaurantName}
                                    onChange={e => setRestaurantName(e.target.value)} 
                                />
                            </div>
                            <div className="mb-0">
                                <input 
                                    type="text"
                                    className="form-control form-control-sm bg-white bg-opacity-10 border-white border-opacity-25 text-white placeholder-white-50"
                                    placeholder="Dirección del Local" 
                                    value={restaurantAddress}
                                    onChange={e => setRestaurantAddress(e.target.value)} 
                                />
                            </div>
                        </div>
                    )}

                    <button 
                        className="btn btn-primary w-100 fw-bold py-2 shadow-sm mb-4"
                        style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            border: 'none',
                            borderRadius: '10px'
                        }}
                        onClick={handleRegister}
                    >
                        Registrarse ahora
                    </button>

                    <div className="text-center small">
                        <p className="mb-1 text-white-50">¿Ya tienes cuenta?</p>
                        <Link to="/login" className="text-white fw-bold text-decoration-none border-bottom border-white border-opacity-50">
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}