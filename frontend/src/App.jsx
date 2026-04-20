import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import RestauranteDashboard from "./pages/RestauranteDashboard";
import ClienteDashboard from "./pages/ClienteDashboard";
import Menu from "./pages/Menu";
import AdminPanel from './components/AdminPanel';
import { getCurrentUser } from './services/api';
import AdminRestaurantes from "./pages/AdminRestaurantes";
import AdminUsuarios from "./pages/AdminUsuarios";

function ProtectedRoute({ children, allowedRoles }) {
    const user = getCurrentUser();
    const token = localStorage.getItem("token");
    
    if (!token || !user) {
        console.log("No autorizado, redirigiendo a login");
        return <Navigate to="/login" />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.log(`Rol ${user.role} no permitido`);
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
        if (user.role === 'restaurante') return <Navigate to="/restaurante/dashboard" />;
        return <Navigate to="/cliente/dashboard" />;
    }
    
    return children;
}

function App() {
    return (
        <div className="container">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/menu" element={<Menu />} />
                
                <Route path="/admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/restaurante/dashboard" element={
                    <ProtectedRoute allowedRoles={['restaurante']}>
                        <RestauranteDashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/cliente/dashboard" element={
                    <ProtectedRoute allowedRoles={['cliente']}>
                        <ClienteDashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/admin/*" element={
                    <ProtectedRoute allowedRoles={['admin', 'restaurante']}>
                        <AdminPanel />
                    </ProtectedRoute>
                } />

                <Route path="/admin/restaurantes" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminRestaurantes />
                    </ProtectedRoute>
                } />

                <Route path="/admin/usuarios" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminUsuarios />
                    </ProtectedRoute>
                } />
                
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </div>
    );
}

export default App;