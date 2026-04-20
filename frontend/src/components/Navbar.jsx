import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/">MenuDigital</Link>
            </div>

            <div className="right-links">
                <Link to="/login">Login</Link>
                <Link to="/register">Registro</Link>
            </div>
        </nav>
    );
}