import { useState } from "react";
import { registerUser } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("cliente");
    const [restaurantName, setRestaurantName] = useState("");
    const [restaurantAddress, setRestaurantAddress] = useState("");
    const [restaurantLogo, setRestaurantLogo] = useState(null); 
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        setError("");

        if (!fullName.trim()) {
            setError("El nombre completo es requerido");
            return;
        }

        if (fullName.trim().length > 100) {
            setError("El nombre completo no puede tener más de 100 caracteres");
            return;
        }
        // ========== VALIDACIONES DE EMAIL ==========
        if (!email.trim()) {
            setError("El correo electrónico es requerido");
            return;
        }
        
        if (!email.includes('@')) {
            setError("Ingresa un correo electrónico válido (debe contener @)");
            return;
        }
        
        if (!email.includes('.')) {
            setError("Ingresa un correo electrónico válido (debe contener .)");
            return;
        }
        
        const emailParts = email.split('@');
        if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
            setError("Ingresa un correo electrónico válido");
            return;
        }
        
        if (email.length > 100) {
            setError("El correo electrónico no puede tener más de 100 caracteres");
            return;
        }
        
        // ========== VALIDACIONES DE CONTRASEÑA ==========
        if (!password) {
            setError("La contraseña es requerida");
            return;
        }
        
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        
        if (password.length > 128) {
            setError("La contraseña no puede tener más de 128 caracteres");
            return;
        }
        
        // ========== CONSTRUIR DATOS ==========
        const data = { 
            full_name: fullName.trim(),
            password,
            email: email.trim().toLowerCase(), 
            role 
        };
        
        // ========== VALIDACIONES PARA RESTAURANTE ==========
        if (role === 'restaurante') {
            if (!restaurantName.trim()) {
                setError("El nombre del restaurante es requerido");
                return;
            }
            
            if (restaurantName.length < 3) {
                setError("El nombre del restaurante debe tener al menos 3 caracteres");
                return;
            }
            
            if (restaurantName.length > 100) {
                setError("El nombre del restaurante no puede tener más de 100 caracteres");
                return;
            }
            
            data.restaurant_name = restaurantName.trim();
            data.restaurant_address = restaurantAddress.trim() || "";
            
            if (restaurantLogo) {
                data.restaurant_logo = restaurantLogo;
            }
        }
        
        // ========== ENVIAR AL BACKEND ==========
        const result = await registerUser(data);

        if (result.id) {
            alert("Usuario creado exitosamente");
            navigate("/login");
        } else {
            // Mostrar error del backend si existe
            if (typeof result === 'object' && result.message) {
                setError(result.message);
            } else if (typeof result === 'object' && result.email) {
                setError("Este correo electrónico ya está registrado");
            } else if (typeof result === 'object' && result.username) {
                setError("Este nombre de usuario ya existe");
            } else {
                setError(result.message || "Error al registrar usuario");
            }
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

                    {/* Campo Nombre Completo */}
                    <div className="mb-3">
                        <input 
                            type="text"
                            className="form-control bg-white bg-opacity-10 border-white border-opacity-25 text-white placeholder-white-50"
                            placeholder="Ingrese su Nombre Completo" 
                            style={{ borderRadius: '10px' }}
                            value={fullName}
                            onChange={e => setFullName(e.target.value)} 
                        />
                    </div>
                    {/* Campo Email */}
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

                    {/* Campo Contraseña */}
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

                    {/* Selector de Rol */}
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

                    {/* Campos para Restaurante */}
                    {role === 'restaurante' && (
                        <div className="p-3 mb-4 rounded animate__animated animate__fadeIn" 
                            style={{ 
                                background: 'rgba(0, 0, 0, 0.25)', 
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '12px'
                            }}>
                            <div className="mb-3">
                                <label className="small fw-bold text-white-50 mb-1">NOMBRE DEL NEGOCIO</label>
                                <input 
                                    type="text"
                                    className="form-control bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                                    placeholder="Ej: La Cabaña Restaurante"
                                    value={restaurantName}
                                    onChange={e => setRestaurantName(e.target.value)} 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="small fw-bold text-white-50 mb-1">DIRECCIÓN</label>
                                <input 
                                    type="text"
                                    className="form-control bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                                    placeholder="Dirección del local (opcional)"
                                    value={restaurantAddress}
                                    onChange={e => setRestaurantAddress(e.target.value)} 
                                />
                            </div>
                            <div className="mb-0">
                                <label className="small fw-bold text-white-50 mb-1">LOGO DEL NEGOCIO</label>
                                <input 
                                    type="file"
                                    className="form-control bg-white bg-opacity-10 border-white border-opacity-25 text-white"
                                    style={{ borderRadius: '10px', padding: '8px' }}
                                    accept="image/*"
                                    onChange={e => setRestaurantLogo(e.target.files[0])}
                                />
                                <small className="text-white-50 opacity-50" style={{ fontSize: '0.65rem' }}>
                                    Sube el logo de tu restaurante (JPG, PNG, WEBP - máximo 2MB)
                                </small>
                            </div>
                        </div>
                    )}

                    {/* Botón Registro */}
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

                    {/* Link a Login */}
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