import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-transparent border-bottom border-white-50 sticky-top shadow-sm" style={{ backdropFilter: 'blur(10px)' }}>
            <div className="container">
                <Link className="navbar-brand fw-bold fs-3 text-white" to="/">
                    MenuDigital
                </Link>
                
                <div className="d-flex gap-3">
                    <Link to="/login" className="btn btn-outline-light rounded-pill px-4">
                        Login
                    </Link>
                    <Link to="/register" className="btn btn-primary rounded-pill px-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                        Registro
                    </Link>
                </div>
            </div>
        </nav>
    );
}