import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="home">
            <h1>Menu Digital</h1>
            <p>Gestiona restaurantes y pedidos fácilmente</p>

            <div className="buttons">
                <Link to="/login">
                    <button>Iniciar Sesión</button>
                </Link>

                <Link to="/register">
                    <button>Registrarse</button>
                </Link>
            </div>
        </div>
    );
}