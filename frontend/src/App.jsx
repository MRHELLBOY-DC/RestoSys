import { Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from './services/api';

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRestaurantes from "./pages/admin/AdminRestaurantes";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminReportes from "./pages/admin/AdminReportes";

// Restaurante
import RestauranteDashboard from "./pages/restaurante/RestauranteDashboard";
import RestauranteMenu from "./pages/restaurante/RestauranteMenu";
import RestaurantePedidos from "./pages/restaurante/RestaurantePedidos";
import RestaurantePagos from "./pages/restaurante/RestaurantePagos";
import RestauranteReportes from "./pages/restaurante/RestauranteReportes";

// Cliente
import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import Menu from "./pages/cliente/Menu";
import Carrito from "./pages/cliente/Carrito";
import MisPedidos from "./pages/cliente/MisPedidos";
import RestauranteMenuPage from "./pages/cliente/RestauranteMenuPage"; // ✅ NUEVA IMPORTACIÓN

// Shared
import Home from "./pages/shared/Home";

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
        <Routes>
            {/* Ruta pública - Home */}
            <Route path="/" element={<Home />} />

            {/* Auth - Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Página pública de restaurante (sin autenticación) */}
            <Route path="/restaurante/:id/menu" element={<RestauranteMenuPage />} />
            
            {/* Cliente */}
            <Route path="/cliente/dashboard" element={
                <ProtectedRoute allowedRoles={['cliente']}>
                    <ClienteDashboard />
                </ProtectedRoute>
            } />
            <Route path="/menu" element={
                <ProtectedRoute allowedRoles={['cliente']}>
                    <Menu />
                </ProtectedRoute>
            } />
            <Route path="/carrito" element={
                <ProtectedRoute allowedRoles={['cliente']}>
                    <Carrito />
                </ProtectedRoute>
            } />
            <Route path="/mis-pedidos" element={
                <ProtectedRoute allowedRoles={['cliente']}>
                    <MisPedidos />
                </ProtectedRoute>
            } />
            
            {/* Admin */}
            <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
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
            <Route path="/admin/reportes" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReportes />
                </ProtectedRoute>
            } />
            
            {/* Restaurante */}
            <Route path="/restaurante/dashboard" element={
                <ProtectedRoute allowedRoles={['restaurante']}>
                    <RestauranteDashboard />
                </ProtectedRoute>
            } />
            <Route path="/restaurante/menu" element={
                <ProtectedRoute allowedRoles={['restaurante']}>
                    <RestauranteMenu />
                </ProtectedRoute>
            } />
            <Route path="/restaurante/pedidos" element={
                <ProtectedRoute allowedRoles={['restaurante']}>
                    <RestaurantePedidos />
                </ProtectedRoute>
            } />
            <Route path="/restaurante/pagos" element={
                <ProtectedRoute allowedRoles={['restaurante']}>
                    <RestaurantePagos />
                </ProtectedRoute>
            } />
            <Route path="/restaurante/reportes" element={
                <ProtectedRoute allowedRoles={['restaurante']}>
                    <RestauranteReportes />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default App;
